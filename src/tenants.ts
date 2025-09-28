// Tenant configuration
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  agent_id: string;
}

export const tenants: Tenant[] = [
  {
    id: "5e952080-3409-4a28-aec9-3590072e0b4b",
    name: "XYZ Corporation",
    slug: "xyz",
    agent_id: "agent1"
  },
  {
    id: "aee3bb90-1aa8-4822-a876-3122be37dbb7",
    name: "ABC Infra",
    slug: "abc",
    agent_id: "agent1"
  },
];

// Default tenant
export const defaultTenant = tenants[0];
