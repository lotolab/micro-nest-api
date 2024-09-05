import * as Joi from 'joi';

export const configValidationSchema = Joi.object().keys({
  STAGE: Joi.string().default('prod'), //envMode
  server: Joi.object({
    port: Joi.number().default(9008),
  }).optional(),
  mysql: Joi.object({
    host: Joi.string().required(),
    port: Joi.number().required(),
    database: Joi.string().required(),
    username: Joi.string().required(),
    password: Joi.string().required(),
    logging: Joi.boolean().default(false),
  }),
  cache: Joi.object({
    redis: Joi.object({
      host: Joi.string().required().default('127.0.0.1'),
      port: Joi.number().required().default(6379),
      db: Joi.number().required().default(2),
      passport: Joi.string().required(),
      ttl: Joi.number().default(5),
    }),
  }),
});
