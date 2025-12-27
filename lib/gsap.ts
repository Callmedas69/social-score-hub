import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// Register GSAP plugin once globally
gsap.registerPlugin(useGSAP);

export { gsap, useGSAP };
