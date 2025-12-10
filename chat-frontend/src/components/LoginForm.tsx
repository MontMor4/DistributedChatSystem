import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type LoginFormProps = {
	onSubmitForm?: (e: React.FormEvent<HTMLFormElement>) => void;
} & React.ComponentProps<"div">;

export function LoginForm({
	className,
	onSubmitForm,
	...props
}: LoginFormProps) {
	const usernameId = React.useId();
	const passwordId = React.useId();

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-xl">Welcome back</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={onSubmitForm}>
						<FieldGroup>
							<Field>
								<FieldLabel htmlFor={usernameId}>Username</FieldLabel>
								<Input
									id={usernameId}
									name="username"
									type="text"
									placeholder="johndoe"
									required
								/>
							</Field>
							<Field>
								<FieldLabel htmlFor={passwordId}>Password</FieldLabel>
								<Input
									id={passwordId}
									name="password"
									type="password"
									required
								/>
							</Field>
							<Field>
								<Button type="submit">Login</Button>
							</Field>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
