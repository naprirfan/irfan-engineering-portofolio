export function getMysqlConfig() {
  const isTest = process.env.NODE_ENV === "test";

  return {
    host: isTest ? process.env.DB_HOST_TEST : process.env.DB_HOST,
    port: Number(isTest ? process.env.DB_PORT_TEST : process.env.DB_PORT),
    user: isTest ? process.env.DB_USER_TEST : process.env.DB_USER,
    password: isTest ? process.env.DB_PASSWORD_TEST : process.env.DB_PASSWORD,
    database: isTest ? process.env.DB_NAME_TEST : process.env.DB_NAME,
    multipleStatements: true,
  };
}
