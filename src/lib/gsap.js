// Single place where GSAP plugins are registered. Import gsap from here,
// never from 'gsap' directly, so useGSAP and ScrollTrigger are always registered.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export { gsap, ScrollTrigger, useGSAP };
