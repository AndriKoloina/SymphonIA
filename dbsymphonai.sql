--
-- PostgreSQL database dump
--

\restrict a7IwDIoVy39akNIZn45cmkcQnWH4BwcZHCUgTwBRbddUL6jCYZEJ2G7ooBFlHys

-- Dumped from database version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: utilisateurs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.utilisateurs (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    mdp text NOT NULL
);


--
-- Name: utilisateurs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.utilisateurs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: utilisateurs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.utilisateurs_id_seq OWNED BY public.utilisateurs.id;


--
-- Name: utilisateurs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utilisateurs ALTER COLUMN id SET DEFAULT nextval('public.utilisateurs_id_seq'::regclass);


--
-- Data for Name: utilisateurs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.utilisateurs (id, email, mdp) FROM stdin;
1	manantsoa03@gmail.com	123azerty
\.


--
-- Name: utilisateurs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.utilisateurs_id_seq', 1, true);


--
-- Name: utilisateurs utilisateurs_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utilisateurs
    ADD CONSTRAINT utilisateurs_email_key UNIQUE (email);


--
-- Name: utilisateurs utilisateurs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.utilisateurs
    ADD CONSTRAINT utilisateurs_pkey PRIMARY KEY (id);


--
-- Name: TABLE utilisateurs; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE public.utilisateurs TO manana;


--
-- Name: SEQUENCE utilisateurs_id_seq; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,USAGE ON SEQUENCE public.utilisateurs_id_seq TO manana;


--
-- PostgreSQL database dump complete
--

\unrestrict a7IwDIoVy39akNIZn45cmkcQnWH4BwcZHCUgTwBRbddUL6jCYZEJ2G7ooBFlHys

