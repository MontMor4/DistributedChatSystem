import * as React from "react";
import { Button } from "@/components/ui/button.tsx";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SignupFormProps = {
	onSubmitForm?: (e: React.FormEvent<HTMLFormElement>) => void;
} & React.ComponentProps<"div">;

export function SignupForm({
	className,
	onSubmitForm,
	...props
}: SignupFormProps) {
	const nameId = React.useId();
	const usernameId = React.useId();
	const passwordId = React.useId();

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-xl">Create your account</CardTitle>
					<CardDescription>
						Enter your data below to create your account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={onSubmitForm}>
						<FieldGroup>
							<Field>
								<FieldLabel htmlFor={nameId}>Full Name</FieldLabel>
								<Input
									id={nameId}
									name="fullName"
									type="text"
									placeholder="John Doe"
									required
								/>
							</Field>
							<Field>
								<FieldLabel htmlFor={usernameId}>Username</FieldLabel>
								<Input
									id={usernameId}
									name="username"
									type="text"
									placeholder="m@example.com"
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
								<Button type="submit">Create Account</Button>
							</Field>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
