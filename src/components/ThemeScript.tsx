export function ThemeScript() {
  const code = `(function(){try{var s=localStorage.getItem('theme');var m=window.matchMedia('(prefers-color-scheme: dark)').matches;var d=s==='dark'||(s===null&&m);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
