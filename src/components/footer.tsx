import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface FooterLinkProps {
  title: string;
  onClick: () => void;
}

const FooterLink: React.FC<FooterLinkProps> = ({ title, onClick }) => {
  const router = useRouter();
      return (
    <button onClick={onClick} className="mb-3 text-left">
      <span className="text-slate-500 dark:text-white text-sm hover:text-white transition-colors">
        {title}
      </span>
    </button>
  );
};

interface FooterSectionProps {
  title: string;
  links: Array<{
    title: string;
    onClick: () => void;
  }>;
}

const FooterSection: React.FC<FooterSectionProps> = ({ title, links }) => {
  return (
    <div className="mb-6 min-w-[150px]">
      <h3 className="text-slate-500 dark:text-white text-base font-semibold mb-4">{title}</h3>
      <div className="flex flex-col">
        {links.map((link, index) => (
          <FooterLink key={index} title={link.title} onClick={link.onClick} />
        ))}
      </div>
    </div>
  );
};

const Footer: React.FC = () => {
  const router = useRouter();
  const handleTherapistLogin = () => {
    // Navigate to therapist login
    router.push('/comingsoon'); 
  };

  const aboutLinks = [
    { title: 'Principles', onClick: () => router.push('/comingsoon') },
    { title: 'The Team', onClick: () => router.push('/comingsoon') },
    { title: 'Roadmap', onClick: () => router.push('/comingsoon') },
    { title: 'Building', onClick: () => router.push('/comingsoon') },
  ];

  const productLinks = [
      { title: 'Features', onClick: () => router.push('/comingsoon') },
    { title: 'Entrepreneurs', onClick: () => router.push('/comingsoon') },
    { title: 'The future', onClick: () => router.push('/comingsoon') },
    { title: 'Creators', onClick: () => router.push('/comingsoon') },

  ];

  const legalLinks = [
    { title: 'Privacy', onClick: () => router.push('/comingsoon') },
    { title: 'Terms', onClick: () => router.push('/comingsoon') },
    { title: 'Cookies', onClick: () => router.push('/comingsoon') },
    { title: 'Legal Info', onClick: () => router.push('/comingsoon') },
  ];

  const socialLinks = [
    { title: 'Instagram', onClick: () => router.push('/comingsoon') },
    { title: 'Discord', onClick: () => router.push('/comingsoon') },
    { title: 'X (Twitter)', onClick: () => router.push('/comingsoon') },
  ];

  return (
    <footer
      className="
        relative py-10 px-4 w-full rounded-[20px] overflow-hidden
        aspect-auto
        lg:aspect-[16/9]
        flex flex-col
        justify-center
      "
    >
      {/* <Image 
        src="/footerbg-dark.png" 
        alt="Footer Background" 
        fill  
        className="object-cover z-0" 
        priority
      /> */}
      <div className="relative z-10 w-4/5 mx-auto">
        <div className="flex flex-row justify-between flex-wrap">
          <FooterSection title="About" links={aboutLinks} />
          <FooterSection title="Product" links={productLinks} />
          <FooterSection title="Legal" links={legalLinks} />
          <FooterSection title="Social" links={socialLinks} />
        </div>
      </div>
    </footer>
  );
};

export default Footer;