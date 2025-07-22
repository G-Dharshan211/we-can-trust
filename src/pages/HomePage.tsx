import { motion } from 'framer-motion';
import { 
  Users, 
  Leaf, 
  GraduationCap, 
  Bike, 
  BookOpen, 
  Monitor,
  Heart
} from 'lucide-react';

import Hero from '../components/Hero';
import ImpactCounter from '../components/ImpactCounter';
import ProgramCard from '../components/ProgramCard';
import Card from '../components/Card';
import Button from '../components/Button';
import TestimonialCard from '../components/TestimonialCard';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';



const HomePage = () => {

    const apiUri = import.meta.env.VITE_API_URI;
    useEffect(() => {
    const HealthCheck = async() => {
      try {
        const res = await fetch(`${apiUri}/api/health`);
        console.log(res.json());
      } catch(erro) {
        console.error(error);
      }
    };
    HealthCheck();
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      <Hero />
      {/* Impact Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">Our Impact</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Through your support, we've been able to make a significant difference in many lives
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <ImpactCounter number={1200} title="Women Trained in Tailoring" />
            <ImpactCounter number={500} title="Trees Planted" />
            <ImpactCounter number={600} title="Students Guided" duration={2.8} />
            <ImpactCounter number={250} title="Digital Literacy Trainees" duration={2.6} />
          </div>
        </div>
      </section>
      
      {/* Programs Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">Our Programs</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We provide a variety of programs designed to empower individuals and communities
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ProgramCard 
              icon={<Users size={28} />}
              title="Tailoring Training"
              description="From 2007-2014, comprehensive training in tailoring and garment making empowered 1,200 rural women with skills for economic independence."
            />
            
            <ProgramCard 
              icon={<Leaf size={28} />}
              title="Environmental Initiatives"
              description="In 2012, we planted 500 trees in colleges and schools across Chennai, promoting environmental awareness and sustainability."
            />
            
            <ProgramCard 
              icon={<GraduationCap size={28} />}
              title="Career Guidance"
              description="From 2014-2024, specialized career counseling for 600 PWD and underprivileged students, helping them navigate professional journeys."
            />
            
            <ProgramCard 
              icon={<Bike size={28} />}
              title="Bicycle Assembly Training"
              description="Technical training in bicycle assembly and maintenance in partnership with TI Cycles for 25 differently-abled persons."
            />
            
            <ProgramCard 
              icon={<BookOpen size={28} />}
              title="Legal Advocacy"
              description="In 2013, filed PIL in Chennai High Court resulting in 636 differently-abled persons securing Group 4 government jobs."
            />
            
            <ProgramCard 
              icon={<Monitor size={28} />}
              title="Digital Literacy"
              description="In 2014, computer training programs with MSME entrepreneurship development for 250 students, bridging the digital divide."
            />
          </div>
          
          <div className="text-center mt-12">
            <Link to="/programs">
              <Button variant="primary" size="lg">
                View All Programs
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Founder Section */}
      <section className="py-16 bg-primary-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center px-4 sm:px-0 ">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="rounded-lg overflow-hidden">
                  <img 
                    src="https://res.cloudinary.com/dclgg7rhe/image/upload/v1750172731/2_sqzyqv_c_crop_w_1200_h_1800_xjhbkl" 
                    alt="Founder" className="w-full h-auto object-cover" 
                  />
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                {/* space-y-6 text-justify px-6 sm:px-1 text-gray-600 */}
                <div className="space-y-6 text-justify text-gray-600 py-4">
                  <h2 className="text-2xl md:text-4xl font-display font-bold text-gray-900 mb-4 text-center">Our Founder's Story</h2>
                  <p className="text-gray-600 mb-6 text-justify">
                  Mr. S. Chezhiyan lost his eyesight due to Glaucoma while studying 12th grade. Despite this challenge,
                  he persevered and earned multiple degrees including a diploma in Electric and Electronics Engineering,
                  a graduate degree in History, post graduation in History, and Master of Philosophy in History.
                  </p>
                  <p className="text-gray-600 mb-6 text-justify">
                  Despite his qualifications, he faced employment discrimination due to his disability. This 
                  experience motivated him to establish this charity to fight for the rights of people with 
                  disabilities and create opportunities for the underprivileged.
                  </p>
                  <blockquote className="border-l-4 border-primary-500 pl-4 italic text-gray-700 mb-6 text-justify">
                  "It is better to light a candle than curse the darkness."
                  </blockquote>
                </div>
                <Link to="/about">
                  <Button variant="outline" >
                    Read Full Story
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">Success Stories</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hear from the people whose lives have been changed through our programs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard
              quote="The tailoring program gave me the skills to start my own business. I now support my family and have even hired two other women from my community."
              name="Lakshmi"
              role="Tailoring Program Graduate"
              
            />
            
            <TestimonialCard
              quote="As a visually impaired person, the diary unit has transformed how I organize my day and track my activities. It's given me greater independence."
              name="Rajesh"
              role="Diary Unit Recipient"
             
            />
            
            <TestimonialCard
              quote="The career guidance program helped me identify my strengths and secure a job that accommodates my disability. I'm now financially independent."
              name="Priya"
              role="Career Guidance Participant"
              
            />
          </div>
        </div>
      </section>
      
      {/* Donate CTA */}
      <section className="py-16 bg-primary-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ 
            backgroundImage: "url('https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <Heart size={48} className="mx-auto text-accent-400 mb-6" />
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">
                Make a Difference Today
              </h2>
              <p className="text-xl text-primary-100 mb-8">
                Your donation helps us continue our work in supporting people with disabilities and underprivileged communities.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <Link to="/donate">
                <Button 
                  size="lg" 
                  variant="primary" 
                  className="bg-accent-500 hover:bg-accent-600 focus:ring-accent-400 text-lg px-8 py-3"
                >
                  Donate Now
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Current Projects */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">Ongoing Projects</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our current initiatives making impact in communities
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6" hover>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Diary Units for Visually Impaired</h3>
              <p className="text-gray-600 mb-4">
                Continuing to provide specialized diary units for visually impaired individuals,
                providing them tools for better organization and independence.
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div className="bg-primary-500 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>75% Complete</span>
                <span>Goal: 100 Units</span>
              </div>
            </Card>
            
            <Card className="p-6" hover>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Career Guidance for Youth</h3>
              <p className="text-gray-600 mb-4">
                Providing specialized career guidance sessions for youth with disabilities, helping them
                identify suitable career paths and opportunities.
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div className="bg-primary-500 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>60% Complete</span>
                <span>Goal: 200 Students</span>
              </div>
            </Card>
            
            <Card className="p-6" hover>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Legal Advocacy</h3>
              <p className="text-gray-600 mb-4">
                Following up on PIL cases in Supreme Court and High Court to ensure proper implementation
                of job reservations for people with disabilities.
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div className="bg-primary-500 h-2 rounded-full" style={{ width: '40%' }}></div>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Ongoing</span>
                <span>Multiple Cases</span>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
