import HeroSection from '../components/HeroSection'
import Footer from '../../../shared/components/layout/Footer'
import Communities from '../components/Communities'
import Feature from '../components/FeatureSection'
import HowItWorks from '../components/HowItWorks'
import Testimonals from '../components/Testimonals'
import FinalCTA from '../components/FinalCTA'
import Navbar from '../../../shared/components/layout/Navbar'

function Landing() {
  return (<div className="theme-original">
    <Navbar />
    <HeroSection />
    <Communities />
    <Feature />
    <HowItWorks />
    <Testimonals />
    <FinalCTA />
    <Footer />
  </div>
  )
}

export default Landing

//
