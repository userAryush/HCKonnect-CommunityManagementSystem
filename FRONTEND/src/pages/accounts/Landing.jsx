import HeroSection from '../../components/landing/HeroSection'
import Footer from '../../components/Footer'
import Communities from '../../components/landing/Communities'
import Feature from '../../components/landing/FeatureSection'
import HowItWorks from '../../components/landing/HowItWorks'
import Testimonals from '../../components/landing/Testimonals'
import FinalCTA from '../../components/landing/FinalCTA'
import Navbar from '../../components/Navbar'

function Landing() {
  return (<div>
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