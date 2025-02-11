import { createClient } from "next-sanity";

const client = createClient({
  projectId: "1ngy7cnb",
  dataset: "production",
  apiVersion: "2024-01-01", 
  useCdn: true, 
  token: "sk7qbbF6dNbeXxPuDE6ewkb1D3IlvKMQ7bYYC4QVFCoLWCpzW4UOqEFyRBkw7TzDYv7ZQuhrSS3QcU7NFiqcYAT2eMgXOoTWqPhn9Z1vD7uR8ROqp0tkN9MW8JbCcJro7bGEN7yL7nuGQ9IynsBfj4I1hQGPyR8DbK7yrNJk6xM1pxMttHi3",
});

export default client;