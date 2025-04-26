import React, { useState, useEffect } from "react";
import Preloader from "../../../components/Preloader.jsx";
import HeroSection from "./HeroSection.jsx";
import FeaturesOverview from "./FeaturesOverview.jsx";
import WhyChooseUs from "./WhyChooseUs.jsx";
import Partners from "./Partners.jsx";
import HowItWorks from "./HowItWorks.jsx";
import Testimonials from "./Testimonials.jsx";
import PopUp from "./PopUp.jsx";
import "../../../styles/Home.css";


export default function Home() {
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setTimeout(() => {
        setShowPopup(true);
      }, 500);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const scrollToFeatures = () => {
    document.getElementById("features-overview").scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div>
      {loading && <Preloader />}
      {!loading && (
        <>
          {/* {showPopup && <PopUp onClose={() => setShowPopup(false)} />} */}
          <HeroSection scrollToFeatures={scrollToFeatures} />



          <FeaturesOverview />
          <WhyChooseUs />
          <HowItWorks />
          <Testimonials />
          <Partners />


        </>
      )}
    </div>
  );
}
