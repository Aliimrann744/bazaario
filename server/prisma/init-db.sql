DO
$$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'bazaario') THEN
    CREATE ROLE bazaario WITH LOGIN PASSWORD 'bazaario123';
  END IF;
END
$$;

ALTER ROLE bazaario CREATEDB;
CREATE DATABASE bazaario OWNER bazaario;
GRANT ALL PRIVILEGES ON DATABASE bazaario TO bazaario;
