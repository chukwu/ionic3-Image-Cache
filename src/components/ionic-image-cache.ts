import { IonicImageCacheConfig } from '../providers/ionic-image-cache-config';
import { Component, Input, Output, NgZone, EventEmitter, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { IonicImageCacheHelperProvider } from '../providers/ionic-image-cache-fileprocessor';
import { Platform } from 'ionic-angular';
import { FileEntry, RemoveResult, DirectoryEntry } from '@ionic-native/file';
import { ImageViewerController } from 'ionic-img-viewer';


@Component({
  selector: 'ionic-image-cache',
  template: `
  <div class="ionic-image-cache-prelative ionic-image-cache-container">
    <div *ngIf="((!srcUrl) && this.imageCacheConfig.spinnerEnabled)" text-center class="ionic-image-cache-absolute-center ionic-image-cache-progress-div">
      <ion-spinner [color]="spinnerColorString" [name]="spinnerNameString"></ion-spinner>
    </div>
    <img #realImage *ngIf="srcUrl" [src]="srcUrl" [alt]="altString" class="{{imgCssClass}}" (click)="presentImage($event, realImage)" />
    <img *ngIf="!srcUrl" [src]="fallback">
  </div>
`,
  styles: [
    `
  ionic-image-cache .ionic-image-cache-container {
    min-height: 20px;
  }
  ionic-image-cache.img-circle img {
    border-radius: 50%;
  }
  ionic-image-cache.img-thumbnail img {
    border-radius: 6px;
  }
  ionic-image-cache .ionic-image-cache-progress-div {
    height: 30px;
  }
  ionic-image-cache img {
    max-width: 100%;
    max-height: 100%;
    width: 100%;
  }
  ionic-image-cache img .width100percent {
    width: 100%;
  }
  ionic-image-cache .ionic-image-cache-prelative {
    position: relative;
  }
  ionic-image-cache .ionic-image-cache-absolute-center {
    margin: auto;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
  }
  ionic-image-cache .ionic-image-cache-display-flex {
    display: flex;
    flex-wrap: wrap;
  }
  ionic-image-cache .ionic-image-cache-display-flex.flex-valign-center {
    align-items: center;
  }
  ionic-image-cache .ionic-image-cache-display-flex.flex-valign-start {
    align-items: flex-start;
  }
  ionic-image-cache .ionic-image-cache-display-flex.flex-valign-end {
    align-items: flex-end;
  }
  ionic-image-cache .ionic-image-cache-display-flex.flex-halign-center {
    justify-content: center;
  }
  ionic-image-cache .ionic-image-cache-display-flex.flex-halign-start {
    justify-content: flex-start;
  }
  ionic-image-cache .ionic-image-cache-display-flex.flex-halign-end {
    justify-content: flex-end;
  }
  ionic-image-cache .ionic-image-cache-display-flex.no-wrap {
    flex-wrap: nowrap;
  }
`
  ],
  encapsulation: ViewEncapsulation.None
})
export class IonicImageCacheComponent {

  avatarbase64:string = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6/NlyAAAAAXNSR0IArs4c6QAABMdJREFUaAXlm1toHFUcxneSZY2NKBUv2OKLVHNZk0AEhXjBENSCRUUflEKV+qDWK1RFii+rL4r4YBBaCiKCYCR5EEEMpangW9CASZbcEBUpZBeUrKA13d1k19+BLoRx53q+2abpwDKZc/7n+3+/OWfuJ87Kyko9dRktbReR9Sy5v63Vau/zO7ixsXF7qVS6hrJckp7SSYq7tP9i++t6vX56c3PzTDabLbrqU8vLy29RlnOXK7cTBwbwFIZPADkJZCXAfDag3ro6MWBAzziOc6y7u/vHsC7L5fKRjo6O3cQfCNsmalwSx/A6Jl4G9IGurq7QsMb4wMDAubm5ucfYWcejgoSNd5RnaYwW6dX9gM6FNeAVt7S09EZbW9sH1DteMXHKZT0M7Bpn2/sUsAakp6fnQzSf5M/zccC82iiBD/b29v7slShOOYfFBDtxP23Lcdo3ayMBpicm6RFzNpYv6H6P6OsqYQkwZk6qDDXTWV1dPWnOD83qopZJgBl2P0RNHCV+eHh4g/ipKG28YhXANY7dglcCYfnvCi0FcNDdk8JniiH9r0LokgFWwBoNa2D2fEt6eNsAc2e1qTLTCh1FD9daYVSVwxoYI5fUGxNrYIb05QXcwh6W7FjrHm4hsOQwtgZW3RAE0aiuBlbAwP7NffSxILOKevL8RL6qrZYVMMlPcR/9la2JMO3JcxrgXJhYvxhb4IyfuLqOYW39uscWeK8aKkBvT0B9YLUt8ABvGTsDs4gC6OCbbKWsgDGQzmQyd9uaiND+4gIbo7xKvd+sk17Gx8fbyXGLbR6rHr6QfMTWRJj2/f39zxB3Q5hYvxgF8J2Li4u3+iVR1HH4vK3QUQCbYf2UwoyXxsLCwl3UWQ9noy8BRucRI5bU0t7e/rhKWwLMcLsjn8/fqDLl1kH/YXdZ3G0JMMmddDptPonIF4ZzFlHzkywq4BS9cEjiyCXCjjzsKrLaVAKP8OlVCj07O7uXB4YjVoSuxjJgo4u5j7jVtL5WNjwyG+AdRs6uxrZiLQXG3LXcar6oMGY00HtQpdXQkQI3RBXr6enpq9G5WaG1VSMJ4NWtCeL+3dnZeWXctn7tti0wd2/WD/vNwOXAnLgkPQxwtZlh2zIpMLAVphD+ZmvKtC8Wi+fQMx/CpYsMGHN5zqr38BhXUjjkq/959J5VQ8uAeY16NOpEtKAdg97nxIwHxUWplwDTCwXeSHwXJXGEWAMtWyTAuJnI5XKJfDYtFApT7NA/VcQSYAx9qTLk1rkwg2fCXR53WwE8xeSx6bgGQrYbJe6PkLG+YXGB6dT6JHOgD4yNjT1EBsmnTC+nTEFcYbb8PnK+RsyiV1yY8kizaUlY4lLxaaVSOdHX1/dLmARJxPBS4F5e+7yAlyfQvyJKjlDAgOYRHV1bW/tiaGjIzIfeFgvP39fh7TDgz2FoXxhTfsA1xL5BZJQhldQlJ4zHMDEOr4pH6HXzaPooP89D9X/AQP5Dg08Yth9z1/RrmGzbKYaJ5bfR42/i6WnWGbe3rcBl7paOr6+vvzc4OCg5I7qTtXKb/5DZA/BROvB51lc1cjtUmKeSz6rV6ruciM42KnbKen5+fjdvYV4C+lWYrk+ZIbBT4Pw4ZmZmdsH6il/Mjqz7D9RWlBEQGS2+AAAAAElFTkSuQmCC`;


  srcUrl:string;
  imageViewerBigSrcUrl:string;
  cache_directory_name:string = this.imageCacheConfig.cacheDirectoryName;
  fallback:string = this.imageCacheConfig.fallbackUrl;
  altString:string = this.imageCacheConfig.alt;
  spinnerNameString:string = this.imageCacheConfig.spinnerName;
  spinnerColorString:string = this.imageCacheConfig.spinnerColor;
  showPrev:boolean | string = true;
  @Input("imgCssClass") imgCssClass:string;
  @ViewChild("realImage") realImage: ElementRef;

  _imageViewerCtrl: ImageViewerController;
  @Input() set src(value: string) {

    if (!this.platform.is('cordova')) {
      this.setImageSrc(value);
      // we are running on a browser, or using livereload
      // plugin will not function in this case
      if(this.imageCacheConfig.debugMode){
        console.log('You are running on a browser or using livereload.');
      }

    }else{
      if(this.helpers.ValidURL(value)){
        this.initialise(value);
      }else{
        this.setImageSrc(value);
        if(this.imageCacheConfig.debugMode){
          console.log(value + ' is not a remote URL');
        }
      }
       
    }

  }

  @Input("clickReturnObj") clickReturnObj:any;
  
  get src(): string {  
    return this.srcUrl;  
  }

  @Input() set highResSrc(value: string) {
    this.imageViewerBigSrcUrl = value;
  }

  get highResSrc(): string {  
    return this.imageViewerBigSrcUrl;  
  }

  @Input() set fallbackUrl(src: string) {
    this.fallback = src;
    
  }
  
  get fallbackUrl(): string {  
    return this.imageCacheConfig.fallbackUrl;  
  }

  //spinnerNameString

  @Input() set spinnerName(text: string) {
    this.spinnerNameString = text;
  }
   
  get spinnerName(): string {  
    return this.imageCacheConfig.spinnerName;  
  }

  @Input() set spinnerColor(text: string) {
    this.spinnerColorString = text;
  }
   
  get spinnerColor(): string {  
    return this.imageCacheConfig.spinnerColor;
  }

  @Input() set alt(text: string) {

   this.altString = text;
  }
  
  get alt(): string {  
    return this.imageCacheConfig.alt;  
  }

  @Input() set showPreview(bool: boolean | string) {

    this.showPrev = (bool == "true" || bool == true);
  }

  get showPreview(): boolean | string {  
    return this.showPrev;  
  }

  @Input() set enableSpinner(bool: boolean | string) {

    this.imageCacheConfig.spinnerEnabled = (bool == "true" || bool == true);
  }

  @Input() set isAvatar(bool: boolean | string) {
    this.fallback = ((bool == "true" || bool == true) ? this.avatarbase64 : this.fallback);
  }
  
  get enableSpinner(): boolean | string {  
    return this.imageCacheConfig.spinnerEnabled;  
  }



  @Output() loaded = new EventEmitter();
  @Output() clicked = new EventEmitter();
  constructor(imageViewerCtrl: ImageViewerController, private ngZone:NgZone, public platform: Platform, public imageCacheConfig:IonicImageCacheConfig, private helpers: IonicImageCacheHelperProvider) {
    this._imageViewerCtrl = imageViewerCtrl;
  }

  presentImage(event,realImage){
    if(this.showPrev == true || this.showPrev == "true"){

      //Change this to add high res image
      let config = {fullResImage: (this.imageViewerBigSrcUrl || this.srcUrl), onCloseCallback: null, enableBackdropDismiss:null};
      const imageViewer = this._imageViewerCtrl.create(realImage, config);
      imageViewer.present();
  
      imageViewer.onDidDismiss((e) => {
        if(this.imageCacheConfig.debugMode){
          console.log(e, "Image viewer closed");
        }      
      });
    }    
    this.clicked.emit({clickReturnObj:this.clickReturnObj});
  }

  setImageSrc(nativeURL:string = null, entry:FileEntry = null){
    let url = entry == null ? nativeURL : entry.nativeURL;
    if(this.platform.is("cordova")){
      if(this.platform.is("ios")){
        url = this.helpers.safeiOSNativeURL(url);
      }
    }

    this.ngZone.run(()=>{
      this.srcUrl = url;
      setTimeout(() =>{
        this.loaded.emit(this.srcUrl);
      },this.helpers.randomIntFromInterval(300, 700));

    })


    

  }

  imageOnLoad(){
    setTimeout(() =>{
      let realImg:HTMLImageElement = this.realImage.nativeElement;
      realImg.addEventListener('loaded', (e) => {
        //console.log("image loaddd");
        this.loaded.emit(this.srcUrl);
      },false)
    },500)
  }

  saveImageToFilesystem(src:string){
    if(this.imageCacheConfig.debugMode){
      console.log("Fetch from server.......", src);
    }
    
    this.helpers.downloadImage(src, this.platform, this.cache_directory_name, this.imageCacheConfig.trustAllHosts).then((entry:FileEntry) =>{
      if(this.imageCacheConfig.debugMode){
        console.log("File saved", entry);
      }
      
      this.setImageSrc(entry.nativeURL, entry); 
    }).catch(err =>{
      if(this.imageCacheConfig.debugMode){
        console.log("Failed to saved file to directory", err);
      }
      this.setImageSrc(src); 
    })
  }



  clearAllCache(){
    if(this.activeDirectory){
      this.helpers.clearAllCache(this.cache_directory_name, this.platform).then((removeResult:RemoveResult) =>{
        if(this.imageCacheConfig.debugMode){
          console.log(removeResult);
        }
        
      });
    }

  }




  verifyFileAvailability(src:string, dEntry:DirectoryEntry){

    this.helpers.getFile(dEntry,this.helpers.extractPath(src)).then((entry:FileEntry) =>{
      if(entry != null){
        this.setImageSrc(null, entry);
      }else{
        this.saveImageToFilesystem(src);
      }      
    })
  }

  
  activeDirectory:DirectoryEntry;
  async initialise(src:string){

    await this.helpers.resolveDirectoryUrl(this.cache_directory_name, this.platform).then((dEntry:DirectoryEntry) =>{
      if(dEntry != null){
        this.activeDirectory = dEntry;
        if(this.imageCacheConfig.debugMode){
          console.log(dEntry);
        }
        
        this.verifyFileAvailability(src, dEntry);
      }else{
        this.saveImageToFilesystem(src);
      }
    })


  }



}
