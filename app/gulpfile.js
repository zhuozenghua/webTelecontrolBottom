var gulp = require('gulp');

var sass = require('gulp-sass');
var cleanCss = require('gulp-clean-css');
var autoprefixer = require('gulp-autoprefixer');

var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var clean = require('gulp-clean');
var sourcemaps = require('gulp-sourcemaps');
var plumber = require('gulp-plumber');

var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var spritesmith = require('gulp.spritesmith');
var cache = require('gulp-cache');

var  rev = require('gulp-rev');//生成版本号
var  revCollector = require('gulp-rev-collector'); //替换版本号

var  htmlmin=require('gulp-htmlmin'); //压缩html插件
var  htmlReplace=require('gulp-html-replace'); //html文件对合并后的文件替换处理

var browserSync = require('browser-sync');
var reload = browserSync.reload;

var runSequence = require('run-sequence');


//清空目标文件
gulp.task('cleanDist', function () {
    return gulp.src(['dist'], {read: false})
    .pipe(clean());
});


//压缩css
gulp.task('css', function() {       // 标注一个依赖，依赖的任务必须在这个任务开始之前被完成
    return gulp.src('src/css/*.css')
        .pipe(concat('all.min.css'))
        .pipe(cleanCss())
        .pipe(rev())      //定义一个流，将所有匹配到的文件名全部生成相应的版本号
        .pipe(gulp.dest('dist/css'))
        .pipe(rev.manifest()) //把所有生成的带版本号的文件名保存到json文件中
        .pipe(gulp.dest('dist/css'))
        ;

});


// 压缩 JS
gulp.task('js-optimize', function() {
    return gulp.src('src/js/*.js')
        // .pipe(sourcemaps.init())
        .pipe(concat('main.js'))
        .pipe(gulp.dest('dist/js/tmp'))
        .pipe(rename('main.min.js'))
        .pipe(uglify())
        .pipe(rev())
        // .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/js'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('dist/js'))
        ;
});



// 图片压缩
gulp.task('img', function() {

    return gulp.src(['src/images/*.{png,jpg,jpeg,ico,gif,svg}'])
        .pipe(plumber())
        .pipe(cache(imagemin({      // 只压缩修改的图片，没有修改的图片直接从缓存文件读取
            progressive: true,
            use: [pngquant()]        // 使用 pngquant 深度压缩 png 图片
        })))
        .pipe(gulp.dest('dist/images'));

});


//替换tml相关资源路径
gulp.task('htmlReplace',function(){
    return gulp.src('src/index.html')
        .pipe(htmlReplace({ //在页面中使用<!-- build:data.js --> <!--endbuild-->   .....
            'js':'js/main.min.js',
            'css':'css/all.min.css'
        }))
        .pipe(gulp.dest('dist/tmp'));
})


//打上版本号
gulp.task('revProduct',['htmlReplace'],function(){   
    var options={
    //省略空格
    collapseWhitespace:true,
    //省略布尔值的属性<input checked="true"/>
    collapseBooleanAttributes:false,
    //删除空格值的属性<input id=''/>
    removeEmptyAttributes:true,
    //删除<script>的type="text/javascript"
    // removeScriptTypeAttributes:true,
    //删除<style>和<link>的type="text/css"
    // removeStyleLinkTypeAttributes:true,
    //压缩页面的JS
    minifyJS:true,
    //压缩页面的CSS
    minifyCSS:true
  };
    return gulp.src(['dist/**/*.json','dist/tmp/index.html'])
    .pipe(revCollector({
        replaceReved: true
    }))
    .pipe(htmlmin(options))
    .pipe(gulp.dest('dist/')); 
})


//生产环境构建
//流程说明，cleanDist先执行，然后runSequence里面的任务按顺序执行
gulp.task('build',['cleanDist'],function(cb){
  condition=false;
  runSequence(['css'],['js-optimize'],['img'],['htmlReplace'],['revProduct'],cb);

})


// gulp.task('build',['cleanDist','css','js-optimize','img','htmlReplace','revProduct']);

//开发环境,将sass,es6语法的js文件打包,这里没有,就不用了
gulp.task('dev',function(){

})


//默认生产环境
gulp.task('default', ['build']);


// 创建一个开发服务器,监视文件改动并重新载入
gulp.task('serve', function() {
  browserSync({
    server: {
      baseDir: 'src'
    }
});
  gulp.watch(['*.html','css/*.css','js/*js'], {cwd: 'src'}, reload);
});