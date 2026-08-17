import JsonLd from "./json-ld";
import Quiz from "./quiz";
import SiteFooter from "./site-footer";
import VisitorCount from "./visitor-count";

export default function Home() {
  return (
    <>
      <JsonLd />
      <Quiz />
      <div className="sheet-tail">
        <VisitorCount />
        <SiteFooter />
      </div>
    </>
  );
}
