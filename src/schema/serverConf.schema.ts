import { z, number, object } from 'zod';

export const API_CONFIG_SCHEMA = object({
  port: number({
    error: (iss)=> iss.input===undefined
    ? 'Port is required for server to run'
    : 'Port must be a number'
  }).or(z.string().regex(/\d+/).transform(Number)),
  host: z.string({
    error: 'Host is required for server to run',
  }),
});

export const DB_CONFIG_SCHEMA = object({
  url: z.string().optional(),
  host: z.string({
    error: 'Database host is required for server to run',
  }),
  port: number({

    error: (iss)=> iss.input===undefined
    ?'Port is required for server to run'
    :'Port must be a number'
  }).or(z.string().regex(/\d+/).transform(Number)),
  username: z.string({
    error: 'Database username is required for server to run',
  }),
  password: z.string({
    error: 'Database password is required for server to run',
  }),
  database: z.string({
    error: 'Database name is required for server to run',
  }),
  dialect: z.string({
    error: 'Database dialect is required for server to run',
  }),
  seederStorage: z.string({
    error: 'Database seeder storage is required for server to run',
  }),
});

export type DBConfigurationType = z.infer<typeof DB_CONFIG_SCHEMA>;

export type ApiConfigurationType = z.infer<typeof API_CONFIG_SCHEMA>;
