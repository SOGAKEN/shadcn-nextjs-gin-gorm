// next-auth.d.ts
import type { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
	interface Session extends DefaultSession {
		accessToken?: string;
		user: {
			id: string;
			email: string;
		};
	}

	interface User extends DefaultUser {
		id: string;
		token: string;
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		accessToken?: string;
		id?: string;
	}
}
