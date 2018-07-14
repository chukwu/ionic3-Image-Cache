import { IonicImageCacheHelperProvider } from './providers/ionic-image-cache-fileprocessor';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { IonicImageCacheComponent } from './components/ionic-image-cache';
import { IonicImageCacheConfig } from './providers/ionic-image-cache-config';
import { IonicImageViewerModule } from 'ionic-img-viewer';
import { File } from '@ionic-native/file';
import { FileTransfer } from '@ionic-native/file-transfer';
 
@NgModule({
    imports: [
        // Only if you use elements like ion-content, ion-xyz...
        IonicModule, IonicImageViewerModule
    ],
    declarations: [
        // declare all components that your module uses
        IonicImageCacheComponent
    ],
    exports: [
        // export the component(s) that you want others to be able to use
        IonicImageCacheComponent
    ]
})
export class IonicImageCacheModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: IonicImageCacheModule,
            providers: [IonicImageCacheHelperProvider, IonicImageCacheConfig, File, FileTransfer]
        };
    }
}