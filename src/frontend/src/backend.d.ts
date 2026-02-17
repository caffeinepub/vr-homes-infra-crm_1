import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Agent {
    id: Principal;
    status: AgentStatus;
    name: string;
    mobile: string;
    photo: ExternalBlob;
}
export interface Lead {
    id: bigint;
    status: string;
    leadType: LeadType;
    propertyType: PropertyType;
    source: string;
    assignedAgent: Principal;
    name: string;
    createdAt: bigint;
    createdBy: Principal;
    leadLevel: string;
    mobile: string;
    price: bigint;
    requirements?: string;
}
export interface UserApprovalInfo {
    status: ApprovalStatus;
    principal: Principal;
}
export interface FollowUp {
    id: bigint;
    status: FollowUpStatus;
    date: bigint;
    agentId: Principal;
    taskType: string;
    leadId: bigint;
    priority: string;
    amount: bigint;
    remarks: string;
}
export interface Owner {
    id: bigint;
    propertyType: PropertyType;
    name: string;
    agentCommission: bigint;
    createdAt: bigint;
    createdBy: Principal;
    address: string;
    mobile: string;
    price: bigint;
    location: string;
    remarks: string;
    verificationStatus: string;
}
export interface UserProfile {
    name: string;
    role: string;
}
export enum AgentStatus {
    active = "active",
    pending = "pending",
    inactive = "inactive",
    rejected = "rejected"
}
export enum ApprovalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum FollowUpStatus {
    pending = "pending",
    completed = "completed",
    overdue = "overdue"
}
export enum LeadType {
    rent = "rent",
    sale = "sale"
}
export enum PropertyType {
    commercial = "commercial",
    house = "house",
    land = "land",
    apartment = "apartment"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createAgent(name: string, mobile: string, photo: ExternalBlob): Promise<Principal>;
    createFollowUp(leadId: bigint, status: FollowUpStatus, remarks: string, date: bigint, priority: string, taskType: string, amount: bigint): Promise<bigint>;
    createLead(name: string, mobile: string, propertyType: PropertyType, leadType: LeadType, price: bigint, assignedAgent: Principal, leadLevel: string, source: string, status: string, requirements: string | null): Promise<bigint>;
    createOwner(name: string, mobile: string, propertyType: PropertyType, location: string, verificationStatus: string, price: bigint, agentCommission: bigint, remarks: string, address: string): Promise<bigint>;
    deleteFollowUp(followUpId: bigint): Promise<void>;
    deleteLead(leadId: bigint): Promise<void>;
    deleteOwner(ownerId: bigint): Promise<void>;
    getAgentDetails(agentId: Principal): Promise<Agent>;
    getAgentFollowUps(agentId: Principal): Promise<Array<FollowUp>>;
    getAgentLeads(agentId: Principal): Promise<Array<Lead>>;
    getAgentOwners(agentId: Principal): Promise<Array<Owner>>;
    getAllAgents(): Promise<Array<Agent>>;
    getAllFollowUps(): Promise<Array<FollowUp>>;
    getAllLeads(): Promise<Array<Lead>>;
    getAllOwners(): Promise<Array<Owner>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getLead(leadId: bigint): Promise<Lead>;
    getOwner(ownerId: bigint): Promise<Owner>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    requestApproval(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
    updateAgentStatus(agentId: Principal, status: AgentStatus): Promise<void>;
    updateFollowUp(followUpId: bigint, status: FollowUpStatus, remarks: string, date: bigint, priority: string, taskType: string, amount: bigint): Promise<void>;
    updateLead(leadId: bigint, name: string, mobile: string, propertyType: PropertyType, leadType: LeadType, price: bigint, assignedAgent: Principal, leadLevel: string, source: string, status: string, requirements: string | null): Promise<void>;
    updateOwner(ownerId: bigint, name: string, mobile: string, propertyType: PropertyType, location: string, verificationStatus: string, price: bigint, agentCommission: bigint, remarks: string, address: string): Promise<void>;
}
