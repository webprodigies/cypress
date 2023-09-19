import Image from 'next/image';
import React from 'react';
import Logo from '../../public/cypresslogo.svg';

const Footer = () => {
  return (
    <footer className="p-20 mt-40 border-t-[1px] border-slate-900 flex flex-col justify-center items-center md:p-5">
      <div className="flex items-center gap-2 mb-4">
        <Image
          src={Logo}
          width={22}
          alt="cypress logo"
        />
        <span className="dark:text-white font-semibold">cypress.</span>
      </div>
      <p className="text-sm text-slate-700 text-center ">
        This website is created for educational purposes only. The content
        provided on this site is intended to serve as general information and
        should not be considered as professional advice. While we strive to
        ensure the accuracy and reliability of the information presented, we
        make no representations or warranties of any kind, express or implied,
        about the completeness, accuracy, reliability, suitability, or
        availability of the website or the information, products, services, or
        related graphics contained on the website. Any reliance you place on
        such information is therefore strictly at your own risk. We will not be
        liable for any loss or damage, including without limitation, indirect or
        consequential loss or damage, arising from the use of this website.
        Please consult with a qualified professional for any specific advice or
        guidance related to your educational or personal needs. By using this
        website, you acknowledge and agree to these terms and conditions.
      </p>
    </footer>
  );
};

export default Footer;
