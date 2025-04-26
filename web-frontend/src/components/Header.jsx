import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import logo_default from "../assets/third-eye.png"

// Parameters for Customization
// title: The page title.
// description: A brief description of the page (important for SEO).
// keywords: Keywords related to the page content.
// author: The author's name or company.
// ogTitle: The Open Graph title for social media previews.
// ogDescription: The Open Graph description for social media previews.
// ogImage: The Open Graph image for social media previews.
// ogUrl: The URL of the page for Open Graph metadata.
// twitterTitle: The title shown in Twitter cards.
// twitterDescription: The description shown in Twitter cards.
// twitterImage: The image shown in Twitter cards.

export default function ThisPageHead({
  favicon,
  title,
  description,
  keywords,
  author,
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
  twitterTitle,
  twitterDescription,
  twitterImage
}) {
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <meta charset="UTF-8" />
      <title>{title || "TrainSync"}</title>
      <meta name="description" content={description || "Your personalized training assistant"} />
      <meta name="keywords" content={keywords || "training, fitness, coaching, TrainSync"} />
      <meta name="author" content={author || "TrainSync Team"} />
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      <link rel="icon" type="image/svg+xml" href={favicon || logo_default} />



      {/* Open Graph Meta Tags for Social Sharing */}
      <meta property="og:title" content={ogTitle || title || "TrainSync"} />
      <meta property="og:description" content={ogDescription || description || "Your personalized training assistant"} />
      <meta property="og:image" content={ogImage || "/default-og-image.jpg"} />
      <meta property="og:url" content={ogUrl || window.location.href} />
      <meta property="og:type" content="website" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={twitterTitle || title || "TrainSync"} />
      <meta name="twitter:description" content={twitterDescription || description || "Your personalized training assistant"} />
      <meta name="twitter:image" content={twitterImage || "/default-twitter-image.jpg"} />

      {/* Apple Touch Icon and Favicon */}
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />

      {/* Additional SEO Enhancements */}
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={ogUrl || window.location.href} />



      <link href="https://fonts.googleapis.com/css2?family=Play:wght@400;700&display=swap" rel="stylesheet" />
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
    </Helmet>
  );
}
