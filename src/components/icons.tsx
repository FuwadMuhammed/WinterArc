import Image from "next/image";

export function LinkedInIcon({ size = 20 }: { size?: number }) {
  return (
    <Image src="/icons/linkedin.png" alt="" width={size} height={size} className="shrink-0 rounded-[4px]" />
  );
}

export function InstagramIcon({ size = 20 }: { size?: number }) {
  return (
    <Image src="/icons/instagram.png" alt="" width={size} height={size} className="shrink-0 rounded-[4px]" />
  );
}
