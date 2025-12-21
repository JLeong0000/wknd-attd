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
		return null; // Don't show install button if already installed
	}

	return (
		<div className="mx-auto max-w-[400px] text-center mt-6 mb-14">
			<button className="w-full text-white p-4 rounded-lg bg-green-600 hover:bg-green-700 cursor-pointer">
				<span className="font-bold">Add app to Home Screen</span>
				{isIOS && (
					<p className="mt-2">
						To install this app on your iOS device, tap the share button <MdOutlineIosShare className="inline" /> and then "Add to Home Screen"
					</p>
				)}
			</button>
		</div>
	);
}

export default InstallPrompt;
