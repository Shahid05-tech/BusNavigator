"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const MetaAiIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="fabGradient" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#3B82F6"/>
                <stop offset="1" stopColor="#8B5CF6"/>
            </linearGradient>
        </defs>
        <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" fill="url(#fabGradient)"/>
        <path d="M12 5.5L13.1818 9.31818L17 10.5L13.1818 11.6818L12 15.5L10.8182 11.6818L7 10.5L10.8182 9.31818L12 5.5Z" fill="white"/>
        <path d="M17.5 14L18.0909 16.0909L20 16.5L18.0909 16.9091L17.5 19L16.9091 16.9091L15 16.5L16.9091 16.0909L17.5 14Z" fill="white"/>
    </svg>
);


export default function AiFab() {
    return (
        <Link href="/blog" passHref>
            <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg flex items-center justify-center cursor-pointer"
                style={{
                    background: "linear-gradient(45deg, #3B82F6, #8B5CF6)"
                }}
            >
                <MetaAiIcon />
            </motion.div>
        </Link>
    )
}
