import React from "react";
import './globals.css'
import { GraduationCap } from "lucide-react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <head>
            <title>BTS - Back to School Onboard</title>
            <meta property="og:title"
                  content="Heroku Back to School AI Challenge 2025"/>
            <meta property="og:description"
                  content="Create AI-powered applications for students or educators, compete in the Heroku Back to School Challenge 2025, and win big. Open globally to all student developers."/>
            <meta property="og:image" content="https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Ffxx2mozqnpxgm5z6hyek.png"/>
            <meta property="og:url" content="https://dev.to/devteam/join-the-heroku-back-to-school-ai-challenge-3000-in-prizes-just-for-students-2me4?"/>
            <meta property="og:type" content="website"/>
            <meta name="twitter:card" content="summary_large_image"/>
            <meta name="twitter:title"
                  content="Heroku Back to School AI Challenge 2025"/>
            <meta name="twitter:description"
                  content="Submit your AI creation for the Heroku Back to School Challenge 2025. Support student success or empower educators—win $1,000!"/>
            <meta name="twitter:image"
                  content="https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Ffxx2mozqnpxgm5z6hyek.png"/>

        </head>
        <body className="bg-[#F9FAFB] text-gray-900 min-h-screen font-sans">
        <header className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-6xl mx-auto flex justify-between items-center p-4 md:p-6">
                {/*<h1 className="text-2xl font-bold text-[#4F46E5]">SchoolAI</h1>*/}
                <h2 className="text-[#4F46E5] font-bold text-xl flex items-center gap-2">
                    <GraduationCap className="w-6 h-6"/>
                    BTS - Back to School
                </h2>
            </div>
        </header>
        <main className="max-w-6xl mx-auto p-6">{children}</main>
        <footer className="bg-white shadow-inner mt-12">
            <div className="max-w-6xl mx-auto p-4 text-center text-gray-500">
                © 2025 BTS | Heroku Dev Challenge BTS Challenge
            </div>
        </footer>
        </body>
        </html>
    );
}
