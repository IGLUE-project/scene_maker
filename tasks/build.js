console.log("Task started: Build");

import fs from 'fs-extra';
import path from "path";
import { execSync } from 'child_process';

const __dirname = path.resolve();
const build_folder = path.join(__dirname, "dist");

//Remove and recreate dist folder
if (fs.existsSync(build_folder)) {
  fs.removeSync(build_folder);
}
fs.ensureDirSync(build_folder);

//Generate JS files
const editorJSFiles = [
  "js/SceneMaker.js",

  "libs/jquery-1.7.2.js",
  "libs/jquery-ui/jquery-ui-1.9.2.js",
  "libs/jquery.mousewheel-3.0.4.js",
  "libs/jquery.carouFredSel/jquery.carouFredSel-6.2.0.js",
  "libs/jquery.fancybox-1.3.4.js",
  "libs/jquery.mCustomScrollbar.js",
  "libs/jquery.ui.touch-punch.0.2.3.js",
  "libs/annotorious/annotorious.js",

  "js/SceneMaker.Locales.js",
  "js/SceneMaker.Constant.js",
  "js/SceneMaker.Configuration.js",
  "js/SceneMaker.User.js",
  "js/SceneMaker.I18n.js",
  "js/SceneMaker.Object.js",
  "js/SceneMaker.Object.PDF.js",
  "js/SceneMaker.Object.GoogleDOC.js",
  "js/SceneMaker.Renderer.js",
  "js/SceneMaker.Scene.js",
  "js/SceneMaker.ObjectPlayer.js",
  "js/SceneMaker.Video.js",
  "js/SceneMaker.Video.Youtube.js",
  "js/SceneMaker.Video.HTML5.js",
  "js/SceneMaker.Audio.js",
  "js/SceneMaker.Audio.HTML5.js",
  "js/SceneMaker.Events.js",
  "js/SceneMaker.EventsNotifier.js",
  "js/SceneMaker.Viewer.js",
  "js/SceneMaker.Debugging.js",
  "js/SceneMaker.Validator.js",
  "js/SceneMaker.Status.js",
  "js/SceneMaker.Status.Device.js",
  "js/SceneMaker.Status.Device.Browser.js",
  "js/SceneMaker.Status.Device.Features.js",
  "js/SceneMaker.ViewerAdapter.js",
  "js/SceneMaker.Text.js",
  "js/SceneMaker.Utils.js",
  "js/SceneMaker.Utils.Loader.js",
  "js/SceneMaker.Slides.js",
  "js/SceneMaker.Screen.js",
  "js/SceneMaker.View.js",
  "js/SceneMaker.Marker.js",
  "js/SceneMaker.FullScreen.js",

  "js/SceneMaker.Editor.js",
  "js/SceneMaker.Editor.Slides.js",
  "js/SceneMaker.Editor.Dummies.js",
  "js/SceneMaker.Editor.Renderer.js",
  "js/SceneMaker.Editor.Carousel.js",
  "js/SceneMaker.Editor.Scrollbar.js",
  "js/SceneMaker.Editor.Video.js",
  "js/SceneMaker.Editor.Audio.js",
  "js/SceneMaker.Editor.Audio.HTML5.js",
  "js/SceneMaker.Editor.Video.HTML5.js",
  "js/SceneMaker.Editor.Video.Youtube.js",
  "js/SceneMaker.Editor.Image.js",
  "js/SceneMaker.Editor.Object.js",
  "js/SceneMaker.Editor.Object.Web.js",
  "js/SceneMaker.Editor.Object.PDF.js",
  "js/SceneMaker.Editor.Object.GoogleDOC.js",
  "js/SceneMaker.Editor.Text.js",
  "js/SceneMaker.Editor.Thumbnails.js",
  "js/SceneMaker.Editor.Settings.js",
  "js/SceneMaker.Editor.Tools.js",
  "js/SceneMaker.Editor.Tools.Menu.js",
  "js/SceneMaker.Editor.Utils.js",
  "js/SceneMaker.Editor.Utils.Loader.js",
  "js/SceneMaker.Editor.Screen.js",
  "js/SceneMaker.Editor.View.js",
  "js/SceneMaker.Editor.Marker.js",
  "js/SceneMaker.Editor.Actions.js",
  "js/SceneMaker.Editor.Caption.js",
  "js/SceneMaker.Editor.Preview.js",
  "js/SceneMaker.Editor.Clipboard.js",
  "js/SceneMaker.Editor.Events.js",
];

//Concat JS files
const editorJSConcatPath = path.join(__dirname, "dist", "scene_maker_editor.js");
const editorJSContent = editorJSFiles.map((f) => fs.readFileSync(path.join(__dirname, f), "utf8")).join("\n\n");
fs.writeFileSync(editorJSConcatPath, editorJSContent, "utf8");

//Minify JS files
try {
  execSync(
    `npx esbuild dist/scene_maker_editor.js --minify --target=es2018 --global-name=SceneMaker --outfile=dist/scene_maker_editor.min.js`,
    { stdio: "inherit" }
  );
  console.log("✅ Build completed: dist/scene_maker_editor.min.js");
} catch (err) {
  console.error("❌ Error executing esbuild:", err.message);
  process.exit(1);
}

//Generate build CSS files
const editorCSSFiles = [
  "libs/jquery.fancybox-1.3.4.css",
  "libs/jquery-ui/jquery-ui-1.9.2.css",
  "libs/jquery.mCustomScrollbar.css",
  "libs/font-awesome/css/font-awesome.css",
  "fonts/fonts.css",
  "libs/annotorious/annotorious.css",
  "stylesheets/viewer.css",
  "stylesheets/carousel.css",
  "stylesheets/toolbar.css",
  "stylesheets/menu.css",
  "stylesheets/editor.css",
];
const editorCSSConcatPath = path.join(__dirname, "dist", "scene_maker_editor.css");
const editorCSSContent = editorCSSFiles.map((f) => fs.readFileSync(path.join(__dirname, f), "utf8")).join("\n\n");
fs.writeFileSync(editorCSSConcatPath, editorCSSContent, "utf8");

//Minify CSS files
try {
  execSync(
    `npx esbuild dist/scene_maker_editor.css --minify --outfile=dist/scene_maker_editor.min.css`,
    { stdio: "inherit" }
  );
  console.log("✅ Build completed: dist/scene_maker_editor.min.css");
} catch (err) {
  console.error("❌ Error executing esbuild:", err.message);
  process.exit(1);
}

console.log("✅ Task finished");