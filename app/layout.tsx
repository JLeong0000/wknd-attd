import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({
	subsets: ["latin"],
	variable: "--font-bricolage",
	weight: ["600", "700", "800"],
});

const APP_NAME = "WAGen";
const APP_DEFAULT_TITLE = "Wknd Attd Gen";
const APP_TITLE_TEMPLATE = "";
const APP_DESCRIPTION = "Generate attendance for the weekend";

export const metadata: Metadata = {
	applicationName: APP_NAME,
	title: {
		default: APP_DEFAULT_TITLE,
		template: APP_TITLE_TEMPLATE,
	},
	description: APP_DESCRIPTION,
	manifest: "/manifest.json",
	appleWebApp: {
		capable: true,
		statusBarStyle: "default",
		title: APP_DEFAULT_TITLE,
		// startUpImage: [],
	},
	formatDetection: {
		telephone: false,
	},
	openGraph: {
		type: "website",
		siteName: APP_NAME,
		title: {
			default: APP_DEFAULT_TITLE,
			template: APP_TITLE_TEMPLATE,
		},
		description: APP_DESCRIPTION,
	},
	twitter: {
		card: "summary",
		title: {
			default: APP_DEFAULT_TITLE,
			template: APP_TITLE_TEMPLATE,
		},
		description: APP_DESCRIPTION,
	},
	icons: [
		{ sizes: "512x512", url: "icon512_maskable.png", type: "image/png" },
		{ sizes: "512x512", url: "icon512_rounded.png", type: "image/png" },
	],
};

export const viewport: Viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#f2f2f7" },
		{ media: "(prefers-color-scheme: dark)", color: "#000000" },
	],
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${display.variable} antialiased`}>{children}</body>
		</html>
	);
}
