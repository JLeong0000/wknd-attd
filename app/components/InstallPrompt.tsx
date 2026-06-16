import { useEffect, useState } from "react";
import { MdOutlineIosShare } from "react-icons/md";

function InstallPrompt() {
	const [isIOS, setIsIOS] = useState(true);
	const [isMobile, setIsMobile] = useState(false);
	const [isStandalone, setIsStandalone] = useState(false);

	useEffect(() => {
		const checkDevice = () => {
			const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
			const isMobileDevice = mobileRegex.test(navigator.userAgent);
			const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

			setIsMobile(isMobileDevice);
			setIsIOS(isIOSDevice);
		};

		checkDevice();
		setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
	}, []);

	if (isStandalone || !isMobile) {
		return null; // Don't show install prompt if already installed
	}

	return (
		<div className="mx-auto w-full max-w-md px-5 pb-12">
			<div className="rounded-2xl bg-surface border border-separator shadow-sm p-4 text-center">
				<p className="font-semibold text-label text-[15px]">Add app to Home Screen</p>
				{isIOS && (
					<p className="mt-1.5 text-label-secondary text-[14px] leading-snug">
						Tap the share button{" "}
						<MdOutlineIosShare className="inline align-middle text-accent" /> then “Add to Home Screen”
					</p>
				)}
			</div>
		</div>
	);
}

export default InstallPrompt;
