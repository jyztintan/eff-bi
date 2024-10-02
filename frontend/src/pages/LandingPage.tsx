import Hero from "../components/Hero/Hero";
import AboutUs from "../components/AboutUs/AboutUs";
import Steps from "../components/Steps/Steps";
import Display from "../components/Display/Display";
import Features from "../components/Features/Features";
import Reviews from "../components/Reviews/Reviews";

const LandingPage = () => {
  return (
    <div>
      <Hero />
      <AboutUs />
      <Steps />
      <Display />
      <Features />
      <Reviews />
    </div>
  );
};

export default LandingPage;