import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import client from "../../../lib/sanityClient";

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials;
        
        // Fetch allowed users from Sanity
        const query = `*[_type == "user" && email == $email][0]`;
        const user = await client.fetch(query, { email });

        if (user && user.password === password) {
          return { id: user._id, name: user.name, email: user.email };
        }
        throw new Error("Invalid credentials");
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, user }) {
      return session;
    },
  },
  secret: "ce2PI8Gh1SWoCwbCZb+h5I6iBnpvfcNUmYQHaCrtCoU=",
});
