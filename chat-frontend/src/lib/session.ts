import { useSession } from "@tanstack/react-start/server";

type SessionUser = {
	token: string;
	userId: string;
	username: string;
	fullName: string;
};

export function useAppSession() {
	return useSession<SessionUser>({
		password: "ChangeThisBeforeShippingToProdOrYouWillBeFired",
	});
}
