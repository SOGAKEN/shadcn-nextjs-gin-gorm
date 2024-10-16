import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
	providers: [
		CredentialsProvider({
			name: "メールアドレスとパスワード",
			credentials: {
				email: {
					label: "Email",
					type: "email",
					placeholder: "メールアドレス",
				},
				password: {
					label: "Password",
					type: "password",
					placeholder: "パスワード",
				},
			},
			async authorize(credentials) {
				console.log(credentials);
				if (!credentials) {
					throw new Error("資格情報が提供されていません");
				}

				try {
					const res = await fetch(
						`${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
						{
							method: "POST",
							body: JSON.stringify({
								email: credentials.email,
								password: credentials.password,
							}),
							headers: { "Content-Type": "application/json" },
						}
					);

					const user = await res.json();

					console.log(user);

					if (res.ok && user.token) {
						return {
							id: user.id.toString(),
							email: user.email,
							token: user.token,
						};
					}
					throw new Error(user.error || "ログインに失敗しました");
				} catch (error) {
					console.error("認証エラー:", error);
					const errorMessage =
						(error as Error).message ||
						"認証中にエラーが発生しました";
					throw new Error(errorMessage);
				}
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.accessToken = user.token;
				token.id = user.id;
			}
			return token;
		},
		async session({ session, token }) {
			if (token && session.user) {
				session.user.id = token.id as string;
				session.accessToken = token.accessToken as string;
			}
			return session;
		},
	},
	pages: {
		signIn: "/login",
	},
	session: {
		strategy: "jwt",
	},
	secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
