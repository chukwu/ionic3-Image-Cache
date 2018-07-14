
# ionic3-Image-Cache
A rewrite of Ionic Image Loader library that fixes the SVG issues, local URL detection and base64 detection yet maintaining all other major features. This **Ionic** plugin also includes features such as image preview. Hats of to @riron for Image viewer 

**Ionic** Module that loads images in a background thread and caches them for later use. Uses `FileTransfer` from `cordova-plugin-filetransfer`, and `cordova-plugin-file` via [`ionic-native`](https://github.com/driftyco/ionic-native) wrappers. This module helps to save Http requests to the server all the time thereby saving bandwidth and other HTTP related issues.



## Features
- Downloads images via a **native thread**. Images will download faster and they will not use the Webview's resources.
- **Caches images** for later use. Remote URLs are counter matched with the file system file and returned.
- Shows a **loading spinner** while the images are loading. (can be disabled and customised with other spinner names in ionic)
- Allows setting a **fallback image** to be displayed in case the image you're trying to show doesn't exist on the web. (optional)
- Works with the **[WKWebView Engine](https://github.com/apache/cordova-plugin-wkwebview-engine)** (iOS), as the images are copied to the temporary directory, which is accessible form within the WebView



## Installation

#### 1. Install the NPM Package
```
npm install --save ionic3-image-cache
```

#### 2. Install Required Plugins
```
npm i --save @ionic-native/file
ionic cordova plugin add cordova-plugin-file
```
```
npm install --save @ionic-native/file-transfer
ionic cordova plugin add cordova-plugin-file-transfer
```

#### 3. Import `IonicImageCacheModule` module

**Add `IonicImageCacheModule.forRoot()` in your app's root module**
```typescript
import {IonicImageCacheModule} from 'ionic3-image-cache';

// import the module
@NgModule({
  ...
  imports: [
    IonicImageCacheModule.forRoot()
  ]
})
export class AppModule {}
```

**Then add `IonicImageCacheComponent` in your child coomponent**
```typescript
import { IonicImageCacheComponent } from 'ionic3-image-cache';;

export class HomePage {

  constructor(public navCtrl: NavController, public ionicImageCacheCtrl:IonicImageCacheComponent) {
    
  }
  
  ionViewDidEnter(){
   this.ionicImageCacheCtrl.blablabla = "whatever";
  }

}
```

# Usage

## Basic Usage
This HTML code demonstrates basic usage of this module:
```html
<ionic-image-cache [src]="this.sender.profile_image.url"></ionic-image-cache>

<ionic-image-cache [isAvatar]="'true'" [showPreview]="'false'" (tap)="whatever($event)" [src]="this.sender.profile_image.url" class="img-circle"></ionic-image-cache>
```

You can also listen to the load event to be notified when the image has been loaded:
```html
<ionic-image-cache [src]="this.sender.profile_image.url" (loaded)="onImageLoad($event)"></ionic-image-cache>
```

...

onImageLoad(data) {
  // do something with the loader
}
```

## Advanced Usage
The `<ionic3-Image-Cache>` component takes many attributes that allows you to customize the image. You can use the following table as a reference:
```

| Attribute Name | Type | Description | Default Value |
| --- | --- | --- | --- |
| src | string | The image URL | N/A |
| fallback | string | Fallback image url to load in case the original image fails to load | N/A |
| spinner | boolean | Show a spinner while the image loads | true |
| isAvatar | boolean | Sets an avatar image as a placeholder rather than image placeholder | false |
| showPreview | boolean | Displays a full screen version of the image with gestures. | true |
| imgCssClass | string | You can inject css classes to the image | N/A |
| highResSrc | string | Set a highres image to use for image preview on click when showPreview is set to true | Original Src |
| fallbackUrl | string | Sets a custom placeholder image Url while awaiting cache load | N/A |
| spinnerName | string | Set a spinner name from the list of ionic spinners list | dots |
| spinnerColor | string | Set a spinner color from your variable set at variables.scss e.g primary | Default |
| fallbackUrl | string | Sets a custom placeholder image Url while awaiting cache load | N/A |
| alt | string | Sets an alternative text when image fails on browser | N/A |
| enableSpinner | boolean | Enable or disable spinner | true |

**Note:** The default values can be changed using the controller instance.


# Global Configuration
This is optional but it is helpful if you wish to set the global configuration for all of your `<img-loader>` instances. To configure the module, inject the `ImageLoaderConfig` provider in your app's main component.
```typescript
import { ImageLoaderConfig } from 'ionic-image-loader';
@Component({
...
})
export class MyMainAppComponent {
  
  constructor(
    private imageLoaderConfig: ImageLoaderConfig // optional, if you wish to configure the service 
  ){
    
    // disable spinners by default, you can add [spinner]="true" to a specific component instance later on to override this
    imageLoaderConfig.enableSpinner(false);
    
    // set the maximum concurrent connections to 10
    imageLoaderConfig.setConcurrency(10);
  }
  
}
```

<br><br>
## Contribution
- **Having an issue**? or looking for support? [Open an issue](https://github.com/chukwu/ionic3-Image-Cache/issues/new) and we will get you the help you need.
- Got a **new feature or a bug fix**? Fork the repo, make your changes, and submit a pull request.

## Support this project
If you find this project useful, please star the repo to let people know that it's reliable. Also, share it with friends and colleagues that might find this useful as well. Thank you :smile:

