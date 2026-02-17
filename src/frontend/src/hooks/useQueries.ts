import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  Agent,
  Lead,
  Owner,
  FollowUp,
  UserProfile,
  UserRole,
  AgentStatus,
  FollowUpStatus,
  PropertyType,
  LeadType,
  ExternalBlob,
  ApprovalStatus,
} from '../backend';
import { Principal } from '@dfinity/principal';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// User Role Queries
export function useGetCallerUserRole() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserRole>({
    queryKey: ['currentUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
  });
}

// Agent Queries
export function useGetAllAgents() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Agent[]>({
    queryKey: ['agents'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllAgents() as unknown as Agent[];
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetAgentDetails(agentId?: Principal) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Agent | null>({
    queryKey: ['agent', agentId?.toString()],
    queryFn: async () => {
      if (!actor || !agentId) return null;
      try {
        return (await actor.getAgentDetails(agentId)) as unknown as Agent;
      } catch (error) {
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!agentId,
  });
}

export function useCreateAgent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; mobile: string; photo: ExternalBlob }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createAgent(data.name, data.mobile, data.photo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}

export function useUpdateAgentStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { agentId: Principal; status: AgentStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateAgentStatus(data.agentId, data.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['agent'] });
    },
  });
}

// Agent Self-Registration
export function useRegisterAsAgent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; mobile: string; photo: ExternalBlob }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerAsAgent(data.name, data.mobile, data.photo);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['agent'] });
    },
  });
}

// Lead Queries
export function useGetAllLeads() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Lead[]>({
    queryKey: ['leads', 'all'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllLeads();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetAgentLeads(agentId?: Principal) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Lead[]>({
    queryKey: ['leads', 'agent', agentId?.toString()],
    queryFn: async () => {
      if (!actor || !agentId) return [];
      return actor.getAgentLeads(agentId);
    },
    enabled: !!actor && !actorFetching && !!agentId,
  });
}

export function useCreateLead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      mobile: string;
      propertyType: PropertyType;
      leadType: LeadType;
      price: bigint;
      assignedAgent: Principal;
      leadLevel: string;
      source: string;
      status: string;
      requirements: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createLead(
        data.name,
        data.mobile,
        data.propertyType,
        data.leadType,
        data.price,
        data.assignedAgent,
        data.leadLevel,
        data.source,
        data.status,
        data.requirements
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

export function useUpdateLead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      leadId: bigint;
      name: string;
      mobile: string;
      propertyType: PropertyType;
      leadType: LeadType;
      price: bigint;
      assignedAgent: Principal;
      leadLevel: string;
      source: string;
      status: string;
      requirements: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateLead(
        data.leadId,
        data.name,
        data.mobile,
        data.propertyType,
        data.leadType,
        data.price,
        data.assignedAgent,
        data.leadLevel,
        data.source,
        data.status,
        data.requirements
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

export function useDeleteLead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leadId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteLead(leadId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

// Owner Queries
export function useGetAllOwners() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Owner[]>({
    queryKey: ['owners', 'all'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllOwners();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetAgentOwners(agentId?: Principal) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Owner[]>({
    queryKey: ['owners', 'agent', agentId?.toString()],
    queryFn: async () => {
      if (!actor || !agentId) return [];
      return actor.getAgentOwners(agentId);
    },
    enabled: !!actor && !actorFetching && !!agentId,
  });
}

export function useCreateOwner() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      mobile: string;
      propertyType: PropertyType;
      location: string;
      verificationStatus: string;
      price: bigint;
      agentCommission: bigint;
      remarks: string;
      address: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createOwner(
        data.name,
        data.mobile,
        data.propertyType,
        data.location,
        data.verificationStatus,
        data.price,
        data.agentCommission,
        data.remarks,
        data.address
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owners'] });
    },
  });
}

export function useUpdateOwner() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      ownerId: bigint;
      name: string;
      mobile: string;
      propertyType: PropertyType;
      location: string;
      verificationStatus: string;
      price: bigint;
      agentCommission: bigint;
      remarks: string;
      address: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateOwner(
        data.ownerId,
        data.name,
        data.mobile,
        data.propertyType,
        data.location,
        data.verificationStatus,
        data.price,
        data.agentCommission,
        data.remarks,
        data.address
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owners'] });
    },
  });
}

export function useDeleteOwner() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ownerId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteOwner(ownerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owners'] });
    },
  });
}

// Follow-Up Queries
export function useGetAllFollowUps() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<FollowUp[]>({
    queryKey: ['followUps', 'all'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllFollowUps();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetAgentFollowUps(agentId?: Principal) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<FollowUp[]>({
    queryKey: ['followUps', 'agent', agentId?.toString()],
    queryFn: async () => {
      if (!actor || !agentId) return [];
      return actor.getAgentFollowUps(agentId);
    },
    enabled: !!actor && !actorFetching && !!agentId,
  });
}

export function useCreateFollowUp() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      leadId: bigint;
      status: FollowUpStatus;
      remarks: string;
      date: bigint;
      priority: string;
      taskType: string;
      amount: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createFollowUp(
        data.leadId,
        data.status,
        data.remarks,
        data.date,
        data.priority,
        data.taskType,
        data.amount
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followUps'] });
    },
  });
}

export function useUpdateFollowUp() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      followUpId: bigint;
      status: FollowUpStatus;
      remarks: string;
      date: bigint;
      priority: string;
      taskType: string;
      amount: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateFollowUp(
        data.followUpId,
        data.status,
        data.remarks,
        data.date,
        data.priority,
        data.taskType,
        data.amount
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followUps'] });
    },
  });
}

export function useDeleteFollowUp() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (followUpId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteFollowUp(followUpId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followUps'] });
    },
  });
}
