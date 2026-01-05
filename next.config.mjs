/** @type {import('next').NextConfig} */
const repoName = "DX_hearling";

const nextConfig = {
  output: "export",          // next buildで out/ を生成 :contentReference[oaicite:4]{index=4}
  basePath: `/${repoName}`,  // https://kmura-09.github.io/DX_hearling/
  trailingSlash: true,
};

export default nextConfig;
