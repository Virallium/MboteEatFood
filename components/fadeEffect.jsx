// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';


// import required modules
import { EffectFade, Navigation, Autoplay } from 'swiper/modules';
import React, { useRef, useState } from 'react';
import img1 from './photos/img1.jpg';
import img2 from './photos/img2.jpg';
import img3 from './photos/img3.jpg';
import img4 from './photos/img4.jpg';
// import photologo2 from './components/photos/mboteeatlogo.jpeg';

 function Fade() {
  return (
    <>
      <Swiper
        spaceBetween={30}
        effect={'fade'}
        navigation={false}
        
        autoplay={{
        delay: 2500,
        disableOnInteraction: false, 
      }}
        modules={[EffectFade, Navigation, Autoplay]}
        className="mySwiper"
      >
        <SwiperSlide>
          <img src={img1} style={{width:"100%", height:"100vh", objectFit:'cover', objectPosition:'center',backgroundRepeat:"no-repeat", aspectRatio:"1/1"}} />
        </SwiperSlide>
        <SwiperSlide>
          <img src={img2} style={{width:"100%", height:"100vh",backgroundPosition:"center", backgroundSize:"cover",backgroundRepeat:"no-repeat", aspectRatio:"1/1"}} />
        </SwiperSlide>
        <SwiperSlide>
          <img src={img3} style={{width:"100%", height:"100vh",backgroundPosition:"center", backgroundSize:"cover",backgroundRepeat:"no-repeat", aspectRatio:"1/1"}} />
        </SwiperSlide>
        <SwiperSlide>
          <img src= {img4} style={{width:"100%", height:"100vh",backgroundPosition:"center", backgroundSize:"cover",backgroundRepeat:"no-repeat", aspectRatio:"1/1"}} />
        </SwiperSlide>
        <SwiperSlide>
          <img src="https://www.startpage.com/av/proxy-image?piurl=https%3A%2F%2Ftse1.mm.bing.net%2Fth%2Fid%2FOIP.i-DTzKh8VtBS4JpNHRqZUgHaFP%3Fpid%3DApi&sp=1777592848T0c395740a878dd62d78f628f598c8fcbeda05cd414e999855044fd9a4404afb5" style={{width:"100%", height:"100vh",backgroundPosition:"center", backgroundSize:"cover",backgroundRepeat:"no-repeat", aspectRatio:"1/1"}} />
        </SwiperSlide>
      </Swiper>
    </>
  );
}
export default Fade