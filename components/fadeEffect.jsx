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
          <img src="https://www.startpage.com/av/proxy-image?piurl=https%3A%2F%2Fd36tnp772eyphs.cloudfront.net%2Fblogs%2F1%2F2020%2F04%2FTour-de-lEchangeur-in-Kinshasa-in-the-Democratic-Republic-of-the-Congo.jpg&sp=1777588008T1ebe781e46feeb227e5cec982b39d7575a4eb60c7716f33d171a6fb51a37f7c5" style={{width:"100%", height:"100vh",backgroundPosition:"center", backgroundSize:"cover",backgroundRepeat:"no-repeat", aspectRatio:"1/1"}} />
        </SwiperSlide>
        <SwiperSlide>
          <img src="https://www.startpage.com/av/proxy-image?piurl=https%3A%2F%2Fpourelle.info%2Fwp-content%2Fuploads%2F2021%2F08%2FIMG-20210813-WA0010.jpg&sp=1777588008Tb1b60a824e6f9282e468a4cf3dffacf510deb81411df56084bb860a65046028f" style={{width:"100%", height:"100vh",backgroundPosition:"center", backgroundSize:"cover",backgroundRepeat:"no-repeat", aspectRatio:"1/1"}} />
        </SwiperSlide>
        <SwiperSlide>
          <img src="https://www.startpage.com/av/proxy-image?piurl=https%3A%2F%2Flh3.googleusercontent.com%2F-LsIYn6MXxqM%2FWCYVxYmqA5I%2FAAAAAAAB7A8%2F1VtU6NIgPrg9-WoUC9sufWz1fm_2DVwvQCHMYBhgL%2F161028_Kinshasa_VernissageIntercoutureHenrikeNaumann_FotoGoetheInstitutKinshasaGitteZschoch-0007.JPG%3Fimgmax%3D500&sp=1777588008T7295b7c1d5fb3fe45a49544ac2b9555575a0674b7876d97fc1b6114a1ec86c74" style={{width:"100%", height:"100vh",backgroundPosition:"center", backgroundSize:"cover",backgroundRepeat:"no-repeat", aspectRatio:"1/1"}} />
        </SwiperSlide>
        <SwiperSlide>
          <img src="https://www.startpage.com/av/proxy-image?piurl=https%3A%2F%2Fimg.atlasobscura.com%2F88R5Jl6gkCqBZJTWFM6sJEFkyLe-AA6W36UKcLb2JKQ%2Frt%3Afit%2Fw%3A600%2Fc%3A3015%3A2010%3Anowe%3A8%3A22%2Fq%3A81%2Fsm%3A1%2Fscp%3A1%2Far%3A1%2FaHR0cHM6Ly9hdGxh%2Fcy1kZXYuczMuYW1h%2Fem9uYXdzLmNvbS91%2FcGxvYWRzL3BsYWNl%2FX2ltYWdlcy8wY2Vl%2FNDFhZS0wNjQxLTRi%2FMDItYmViNi1lOWIy%2FZmNlZjc4ZTIxMDdh%2FYmJiNWE1M2Q2YTc5%2FYWZfVG91cl9kZV9s%2FJ0XMgWNoYW5nZXVy%2FX2RlX0xpbWV0ZS5q%2FcGVn.jpg&sp=1777588008T061d82026e4396628aa5ec4cd988108aca75189b535715ef67f8736de398787f" style={{width:"100%", height:"100vh",backgroundPosition:"center", backgroundSize:"cover",backgroundRepeat:"no-repeat", aspectRatio:"1/1"}} />
        </SwiperSlide>
        <SwiperSlide>
          <img src="https://www.startpage.com/av/proxy-image?piurl=https%3A%2F%2Ftse1.mm.bing.net%2Fth%2Fid%2FOIP.i-DTzKh8VtBS4JpNHRqZUgHaFP%3Fpid%3DApi&sp=1777592848T0c395740a878dd62d78f628f598c8fcbeda05cd414e999855044fd9a4404afb5" style={{width:"100%", height:"100vh",backgroundPosition:"center", backgroundSize:"cover",backgroundRepeat:"no-repeat", aspectRatio:"1/1"}} />
        </SwiperSlide>
      </Swiper>
    </>
  );
}
export default Fade