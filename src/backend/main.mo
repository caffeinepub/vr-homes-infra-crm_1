import Map "mo:core/Map";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Int "mo:core/Int";

import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

import UserApproval "user-approval/approval";

actor {
  // Include authorization and user approval
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let approvalState = UserApproval.initState(accessControlState);
  include MixinStorage();

  // Enums and Types
  public type AgentStatus = {
    #active;
    #inactive;
    #pending;
    #rejected;
  };

  public type FollowUpStatus = {
    #pending;
    #overdue;
    #completed;
  };

  public type LeadType = {
    #rent;
    #sale;
  };

  public type PropertyType = {
    #house;
    #apartment;
    #land;
    #commercial;
  };

  public type Agent = {
    id : Principal;
    name : Text;
    mobile : Text;
    photo : Storage.ExternalBlob;
    status : AgentStatus;
  };

  public type Lead = {
    id : Nat;
    name : Text;
    mobile : Text;
    propertyType : PropertyType;
    leadType : LeadType;
    price : Nat;
    assignedAgent : Principal;
    leadLevel : Text;
    source : Text;
    createdAt : Int;
    status : Text;
    requirements : ?Text;
    createdBy : Principal;
  };

  public type Owner = {
    id : Nat;
    name : Text;
    mobile : Text;
    propertyType : PropertyType;
    location : Text;
    verificationStatus : Text;
    price : Nat;
    agentCommission : Nat;
    remarks : Text;
    address : Text;
    createdAt : Int;
    createdBy : Principal;
  };

  public type FollowUp = {
    id : Nat;
    leadId : Nat;
    agentId : Principal;
    status : FollowUpStatus;
    remarks : Text;
    date : Int;
    priority : Text;
    taskType : Text;
    amount : Nat;
  };

  public type UserProfile = {
    name : Text;
    role : Text;
  };

  // State storage
  let agents = Map.empty<Principal, Agent>();
  let leads = Map.empty<Nat, Lead>();
  let owners = Map.empty<Nat, Owner>();
  let followUps = Map.empty<Nat, FollowUp>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextLeadId = 1;
  var nextOwnerId = 1;
  var nextFollowUpId = 1;

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Approval endpoints
  public query ({ caller }) func isCallerApproved() : async Bool {
    AccessControl.hasPermission(accessControlState, caller, #admin) or UserApproval.isApproved(approvalState, caller);
  };

  public shared ({ caller }) func requestApproval() : async () {
    UserApproval.requestApproval(approvalState, caller);
  };

  public shared ({ caller }) func setApproval(user : Principal, status : UserApproval.ApprovalStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.setApproval(approvalState, user, status);
  };

  public query ({ caller }) func listApprovals() : async [UserApproval.UserApprovalInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.listApprovals(approvalState);
  };

  // Helper functions
  func getAgent(agentId : Principal) : Agent {
    switch (agents.get(agentId)) {
      case (?agent) { agent };
      case (null) { Runtime.trap("Agent not found") };
    };
  };

  func ensureAgentApproved(caller : Principal) {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      if (not isAgentApproved(caller)) {
        Runtime.trap("Unauthorized: Agent not approved or active");
      };
    };
  };

  func isAgentApproved(agentId : Principal) : Bool {
    switch (agents.get(agentId)) {
      case (?agent) { agent.status == #active };
      case (null) { false };
    };
  };

  module Agent {
    public func compareByName(agent1 : Agent, agent2 : Agent) : Order.Order {
      Text.compare(agent1.name, agent2.name);
    };
  };

  func agentsToArray() : [Agent] {
    agents.values().toArray();
  };

  // Agent Management
  public query ({ caller }) func getAllAgents() : async [Agent] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all agents");
    };
    agentsToArray().sort(Agent.compareByName);
  };

  public query ({ caller }) func getAgentDetails(agentId : Principal) : async Agent {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      if (caller != agentId) {
        Runtime.trap("Unauthorized: Can only view your own agent details");
      };
    };
    getAgent(agentId);
  };

  public shared ({ caller }) func createAgent(name : Text, mobile : Text, photo : Storage.ExternalBlob) : async Principal {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create agents");
    };
    let agentId = Principal.fromText(name # mobile # Time.now().toText());
    let agent : Agent = {
      id = agentId;
      name;
      mobile;
      photo;
      status = #pending;
    };
    agents.add(agentId, agent);
    agentId;
  };

  public shared ({ caller }) func updateAgentStatus(agentId : Principal, status : AgentStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update agent status");
    };
    switch (agents.get(agentId)) {
      case (?agent) {
        let updatedAgent : Agent = {
          id = agent.id;
          name = agent.name;
          mobile = agent.mobile;
          photo = agent.photo;
          status;
        };
        agents.add(agentId, updatedAgent);
      };
      case (null) { Runtime.trap("Agent not found") };
    };
  };

  // Lead Management
  module Lead {
    public func compareByName(lead1 : Lead, lead2 : Lead) : Order.Order {
      Text.compare(lead1.name, lead2.name);
    };
  };

  public query ({ caller }) func getAllLeads() : async [Lead] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all leads");
    };
    leads.values().toArray().sort(Lead.compareByName);
  };

  public query ({ caller }) func getAgentLeads(agentId : Principal) : async [Lead] {
    ensureAgentApproved(caller);
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      if (caller != agentId) {
        Runtime.trap("Unauthorized: Can only view your own leads");
      };
    };
    let allLeads = leads.values().toArray();
    let filteredLeads = allLeads.filter(
      func(lead : Lead) : Bool {
        lead.createdBy == agentId or lead.assignedAgent == agentId;
      },
    );
    filteredLeads.sort(Lead.compareByName);
  };

  public query ({ caller }) func getLead(leadId : Nat) : async Lead {
    ensureAgentApproved(caller);
    switch (leads.get(leadId)) {
      case (?lead) {
        if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
          if (lead.createdBy != caller and lead.assignedAgent != caller) {
            Runtime.trap("Unauthorized: Can only view your own leads");
          };
        };
        lead;
      };
      case (null) { Runtime.trap("Lead not found") };
    };
  };

  public shared ({ caller }) func createLead(
    name : Text,
    mobile : Text,
    propertyType : PropertyType,
    leadType : LeadType,
    price : Nat,
    assignedAgent : Principal,
    leadLevel : Text,
    source : Text,
    status : Text,
    requirements : ?Text,
  ) : async Nat {
    ensureAgentApproved(caller);
    let lead : Lead = {
      id = nextLeadId;
      name;
      mobile;
      propertyType;
      leadType;
      price;
      assignedAgent;
      leadLevel;
      source;
      createdAt = Time.now();
      status;
      requirements;
      createdBy = caller;
    };
    leads.add(nextLeadId, lead);
    let currentId = nextLeadId;
    nextLeadId += 1;
    currentId;
  };

  public shared ({ caller }) func updateLead(
    leadId : Nat,
    name : Text,
    mobile : Text,
    propertyType : PropertyType,
    leadType : LeadType,
    price : Nat,
    assignedAgent : Principal,
    leadLevel : Text,
    source : Text,
    status : Text,
    requirements : ?Text,
  ) : async () {
    ensureAgentApproved(caller);
    switch (leads.get(leadId)) {
      case (?existingLead) {
        if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
          if (existingLead.createdBy != caller and existingLead.assignedAgent != caller) {
            Runtime.trap("Unauthorized: Can only update your own leads");
          };
        };
        let updatedLead : Lead = {
          id = existingLead.id;
          name;
          mobile;
          propertyType;
          leadType;
          price;
          assignedAgent;
          leadLevel;
          source;
          createdAt = existingLead.createdAt;
          status;
          requirements;
          createdBy = existingLead.createdBy;
        };
        leads.add(leadId, updatedLead);
      };
      case (null) { Runtime.trap("Lead not found") };
    };
  };

  public shared ({ caller }) func deleteLead(leadId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete leads");
    };
    switch (leads.get(leadId)) {
      case (?_) {
        leads.remove(leadId);
      };
      case (null) { Runtime.trap("Lead not found") };
    };
  };

  // Owner Management
  module Owner {
    public func compareByName(owner1 : Owner, owner2 : Owner) : Order.Order {
      Text.compare(owner1.name, owner2.name);
    };
  };

  public query ({ caller }) func getAllOwners() : async [Owner] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all owners");
    };
    owners.values().toArray().sort(Owner.compareByName);
  };

  public query ({ caller }) func getAgentOwners(agentId : Principal) : async [Owner] {
    ensureAgentApproved(caller);
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      if (caller != agentId) {
        Runtime.trap("Unauthorized: Can only view your own owners");
      };
    };
    let allOwners = owners.values().toArray();
    let filteredOwners = allOwners.filter(
      func(owner : Owner) : Bool {
        owner.createdBy == agentId;
      },
    );
    filteredOwners.sort(Owner.compareByName);
  };

  public query ({ caller }) func getOwner(ownerId : Nat) : async Owner {
    ensureAgentApproved(caller);
    switch (owners.get(ownerId)) {
      case (?owner) {
        if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
          if (owner.createdBy != caller) {
            Runtime.trap("Unauthorized: Can only view your own owners");
          };
        };
        owner;
      };
      case (null) { Runtime.trap("Owner not found") };
    };
  };

  public shared ({ caller }) func createOwner(
    name : Text,
    mobile : Text,
    propertyType : PropertyType,
    location : Text,
    verificationStatus : Text,
    price : Nat,
    agentCommission : Nat,
    remarks : Text,
    address : Text,
  ) : async Nat {
    ensureAgentApproved(caller);
    let owner : Owner = {
      id = nextOwnerId;
      name;
      mobile;
      propertyType;
      location;
      verificationStatus;
      price;
      agentCommission;
      remarks;
      address;
      createdAt = Time.now();
      createdBy = caller;
    };
    owners.add(nextOwnerId, owner);
    let currentId = nextOwnerId;
    nextOwnerId += 1;
    currentId;
  };

  public shared ({ caller }) func updateOwner(
    ownerId : Nat,
    name : Text,
    mobile : Text,
    propertyType : PropertyType,
    location : Text,
    verificationStatus : Text,
    price : Nat,
    agentCommission : Nat,
    remarks : Text,
    address : Text,
  ) : async () {
    ensureAgentApproved(caller);
    switch (owners.get(ownerId)) {
      case (?existingOwner) {
        if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
          if (existingOwner.createdBy != caller) {
            Runtime.trap("Unauthorized: Can only update your own owners");
          };
        };
        let updatedOwner : Owner = {
          id = existingOwner.id;
          name;
          mobile;
          propertyType;
          location;
          verificationStatus;
          price;
          agentCommission;
          remarks;
          address;
          createdAt = existingOwner.createdAt;
          createdBy = existingOwner.createdBy;
        };
        owners.add(ownerId, updatedOwner);
      };
      case (null) { Runtime.trap("Owner not found") };
    };
  };

  public shared ({ caller }) func deleteOwner(ownerId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete owners");
    };
    switch (owners.get(ownerId)) {
      case (?_) {
        owners.remove(ownerId);
      };
      case (null) { Runtime.trap("Owner not found") };
    };
  };

  // Follow-Up Management
  module FollowUp {
    public func compareByDate(followUp1 : FollowUp, followUp2 : FollowUp) : Order.Order {
      Int.compare(followUp1.date, followUp2.date);
    };
  };

  public query ({ caller }) func getAllFollowUps() : async [FollowUp] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all follow-ups");
    };
    followUps.values().toArray().sort(FollowUp.compareByDate);
  };

  public query ({ caller }) func getAgentFollowUps(agentId : Principal) : async [FollowUp] {
    ensureAgentApproved(caller);
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      if (caller != agentId) {
        Runtime.trap("Unauthorized: Can only view your own follow-ups");
      };
    };
    let allFollowUps = followUps.values().toArray();
    let filteredFollowUps = allFollowUps.filter(
      func(followUp : FollowUp) : Bool {
        followUp.agentId == agentId;
      },
    );
    filteredFollowUps.sort(FollowUp.compareByDate);
  };

  public shared ({ caller }) func createFollowUp(
    leadId : Nat,
    status : FollowUpStatus,
    remarks : Text,
    date : Int,
    priority : Text,
    taskType : Text,
    amount : Nat,
  ) : async Nat {
    ensureAgentApproved(caller);
    switch (leads.get(leadId)) {
      case (?lead) {
        if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
          if (lead.createdBy != caller and lead.assignedAgent != caller) {
            Runtime.trap("Unauthorized: Can only create follow-ups for your own leads");
          };
        };
      };
      case (null) { Runtime.trap("Lead not found") };
    };
    let followUp : FollowUp = {
      id = nextFollowUpId;
      leadId;
      agentId = caller;
      status;
      remarks;
      date;
      priority;
      taskType;
      amount;
    };
    followUps.add(nextFollowUpId, followUp);
    let currentId = nextFollowUpId;
    nextFollowUpId += 1;
    currentId;
  };

  public shared ({ caller }) func updateFollowUp(
    followUpId : Nat,
    status : FollowUpStatus,
    remarks : Text,
    date : Int,
    priority : Text,
    taskType : Text,
    amount : Nat,
  ) : async () {
    ensureAgentApproved(caller);
    switch (followUps.get(followUpId)) {
      case (?existingFollowUp) {
        if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
          if (existingFollowUp.agentId != caller) {
            Runtime.trap("Unauthorized: Can only update your own follow-ups");
          };
        };
        let updatedFollowUp : FollowUp = {
          id = existingFollowUp.id;
          leadId = existingFollowUp.leadId;
          agentId = existingFollowUp.agentId;
          status;
          remarks;
          date;
          priority;
          taskType;
          amount;
        };
        followUps.add(followUpId, updatedFollowUp);
      };
      case (null) { Runtime.trap("Follow-up not found") };
    };
  };

  public shared ({ caller }) func deleteFollowUp(followUpId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete follow-ups");
    };
    switch (followUps.get(followUpId)) {
      case (?_) {
        followUps.remove(followUpId);
      };
      case (null) { Runtime.trap("Follow-up not found") };
    };
  };
};
