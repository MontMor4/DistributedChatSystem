import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { LoginForm } from "@/components/LoginForm";
import { useAppSession } from "@/lib/session.ts";
import { login } from "@/service/auth.ts";

export const loginFn = createServerFn({ method: "POST" })
	.inputValidator((d) =>
		z
			.object({
				username: z.string().min(1),
				password: z
					.string()
					.min(6, "Password must be at least 6 characters long"),
			})
			.parse(d),
	)
	.handler(async ({ data }) => {
		const res = await login(data);

		const session = await useAppSession();
		await session.update({
			token: res.token,
			username: data.username,
			userId: res.userId,
		});

        return {
            token: res.token,
            userId: res.userId,
            username: data.username
        };
	});

export const Route = createFileRoute("/login")({
	component: RouteComponent,
});

function RouteComponent() {
    const navigate = useNavigate();
	const login = useServerFn(loginFn);
	const loginMutation = useMutation({
		mutationFn: login,
        onSuccess: () => {
            navigate({ to: "/" });
        }
	});

	function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const data = {
			username: formData.get("username") as string,
			password: formData.get("password") as string,
		};
		loginMutation.mutate({ data });
	}

	return (
		<div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
			<div className="w-full max-w-sm md:max-w-4xl">
				<LoginForm onSubmitForm={onSubmit} />
			</div>
		</div>
	);
}
