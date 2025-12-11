import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { SignupForm } from "@/components/SignupForm";
import { useAppSession } from "@/lib/session.ts";
import { registerUser } from "@/service/auth.ts";

export const signupFn = createServerFn({ method: "POST" })
	.inputValidator((d) =>
		z
			.object({
				username: z.string().min(1),
				password: z
					.string()
					.min(6, "Password must be at least 6 characters long"),
				fullName: z.string().min(1, "Full name is required"),
			})
			.parse(d),
	)
	.handler(async ({ data }) => {
		const res = await registerUser(data);

		const session = await useAppSession();
		await session.update({
			token: res.token,
			fullName: data.fullName,
			username: data.username,
			userId: res.userId,
		});

        return {
            token: res.token,
            userId: res.userId,
            username: data.username,
            fullName: data.fullName
        };
	});

export const Route = createFileRoute("/signup")({
	component: RouteComponent,
});

function RouteComponent() {
    const navigate = useNavigate();
	const signup = useServerFn(signupFn);
	const signupMutation = useMutation({
		mutationFn: signup,
        onSuccess: () => {
            navigate({ to: "/" });
        }
	});

	function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const data = {
			fullName: formData.get("fullName") as string,
			username: formData.get("username") as string,
			password: formData.get("password") as string,
		};
		signupMutation.mutate({ data });
	}

	return (
		<div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
			<div className="flex w-full max-w-sm flex-col gap-6">
				<SignupForm onSubmitForm={onSubmit} />
			</div>
		</div>
	);
}
