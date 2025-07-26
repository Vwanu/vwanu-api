import { z, number, object } from 'zod';

export const API_CONFIG_SCHEMA = object({
  port: number({
    invalid_type_error: 'Port must be a number',
    required_error: 'Port is required for server to run',
  }).or(z.string().regex(/\d+/).transform(Number)),
  host: z.string({
    required_error: 'Host is required for server to run',
  }),
});

export const DB_CONFIG_SCHEMA = object({
  url: z.string().optional(),
  host: z.string({
    required_error: 'Database host is required for server to run',
  }),
  port: number({
    invalid_type_error: 'Port must be a number',
    required_error: 'Port is required for server to run',
  }).or(z.string().regex(/\d+/).transform(Number)),
  username: z.string({
    required_error: 'Database username is required for server to run',
  }),
  password: z.string({
    required_error: 'Database password is required for server to run',
  }),
  database: z.string({
    required_error: 'Database name is required for server to run',
  }),
  dialect: z.string({
    required_error: 'Database dialect is required for server to run',
  }),
  seederStorage: z.string({
    required_error: 'Database seeder storage is required for server to run',
  }),
});

export type DBConfigurationType = z.infer<typeof DB_CONFIG_SCHEMA>;

export type ApiConfigurationType = z.infer<typeof API_CONFIG_SCHEMA>;
