import { Platform, Events } from 'ionic-angular';
import { Injectable, NgZone } from '@angular/core';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer';
import { File, FileEntry, RemoveResult, DirectoryEntry } from '@ionic-native/file';


@Injectable()
export class IonicImageCacheHelperProvider {

  constructor(public event: Events, private transfer: FileTransfer, private file: File, public ngZone: NgZone) {

  }


  randomIntFromInterval(min,max)
  {
      return Math.floor(Math.random()*(max-min+1)+min);
  }
  

  createDir(localFolderPath:string, platform:Platform):Promise<DirectoryEntry>{
    return new Promise(resolver =>{
      let targetPath:string = "";
      if (platform.is('ios')) {
        targetPath = this.file.documentsDirectory;
      }
      else if(platform.is('android')) {
        targetPath = this.file.externalDataDirectory;
      }
      this.file.createDir(targetPath, localFolderPath, false).then((directory: DirectoryEntry) => {
        resolver(directory);
      }).catch(err =>{
        resolver(null);
        console.log("Create directory fail",err);
      })
    })    
  }
  checkDir(localFolderPath:string, platform:Platform):Promise<boolean>{
    return new Promise(resolver =>{
      let targetPath:string = "";
      if (platform.is('ios')) {
        targetPath = this.file.documentsDirectory;
      }
      else if(platform.is('android')) {
        targetPath = this.file.externalDataDirectory;
      }
      this.file.checkDir(targetPath, localFolderPath).then((yesNo: boolean) => {
        resolver(yesNo);
      }).catch(err =>{
        resolver(false);
        console.log("Check directory",err);
        this.createDir(localFolderPath, platform);
      })
    })    
  }

  resolveDirectoryUrl(localFolderPath:string, platform:Platform):Promise<DirectoryEntry>{
    return new Promise(resolver =>{
      let targetPath:string = "";
      if (platform.is('ios')) {
        targetPath = this.file.documentsDirectory + localFolderPath;
      }
      else if(platform.is('android')) {
        targetPath = this.file.externalDataDirectory + localFolderPath;
      }

      // console.log(targetPath);
      this.file.resolveDirectoryUrl(targetPath).then((dEntry: DirectoryEntry) => {
        resolver(dEntry);
      }).catch(err =>{
        resolver(null);
        console.log("resolveDirectoryUrl",err);
        this.createDir(localFolderPath, platform);
      })
    })    
  }
  
  clearAllCache(localFolderPath:string, platform:Platform){
    return new Promise(resolver =>{
      let targetPath:string = "";
      if (platform.is('ios')) {
        targetPath = this.file.documentsDirectory;
      }
      else if(platform.is('android')) {
        targetPath = this.file.externalDataDirectory;
      }
      this.file.removeRecursively(targetPath, localFolderPath).then((removeResult: RemoveResult) => {
        resolver(removeResult);
      }).catch(err =>{
        console.log("Clear directory",err);
      })
    })

  }

  getFilesInFolder(localFolderPath:string, platform:Platform){
    return new Promise(resolver =>{
      let targetPath:string = "";
      if (platform.is('ios')) {
        targetPath = this.file.documentsDirectory;
      }
      else if(platform.is('android')) {
        targetPath = this.file.externalDataDirectory;
      }
      this.file.listDir(targetPath, localFolderPath).then((entry: Array<FileEntry>) => {
        resolver(entry);
      }).catch(err =>{
        console.log("Get all files in folder ",err);
      })
    })

  }

  checkFile(localFolderPath:string, platform:Platform, filename:string){
    return new Promise(resolver =>{
      let targetPath:string = "";
      if (platform.is('ios')) {
        targetPath = this.file.documentsDirectory + localFolderPath;
      }
      else if(platform.is('android')) {
        targetPath = this.file.externalDataDirectory + localFolderPath;
      }
      this.file.checkFile(targetPath, filename).then((result: boolean) => {
        // console.log("File exists");
        resolver({yesNo: result, fileURL: targetPath + "/" + filename});
      }).catch(err =>{
        resolver({yesNo: false, fileURL: targetPath + "/" + filename});
        console.log("Get if file is availbale ",err);
      })
    })

  }

  getFile(DEntry:DirectoryEntry, fileName:string):Promise<FileEntry>{
    return new Promise(resolver =>{
      this.file.getFile(DEntry, fileName,{ create: false }).then((entry: FileEntry) => {
        // console.log("File exists");
        resolver(entry);
      }).catch(err =>{
        resolver(null);
        console.log("Get file failed ",fileName,err);
      })
    })

  }

  extractPath(remoteURL:string, asFilename:boolean = true){
    let path:string = (new URL(remoteURL)).pathname
    if(asFilename){
      path = this.replace("/","",path);
      path = this.replace(" ","",path);
    }
    // console.log(path);
    return path;
  }

  ValidURL(str:string):boolean {
    let result:boolean = str == undefined ? false : ((str.indexOf("http://") > -1 || str.indexOf("https://") > -1) && str.indexOf("data:image/") < 0);
    // console.log(result, str);
    return result;
  }

  downloadImage(fileurl:string, platform:Platform, localFolderPath: string = "cache_assets", trustAll:boolean = true){
    return new Promise( (resolver, reject) =>{
      const fileTransfer: FileTransferObject = this.transfer.create();
    
      let ext = fileurl.split('.').pop();
      let prog:number = 0;
      let targetPath:string = "";
  
      //android fix
      let fpath = this.extractPath(fileurl);
      if(fpath.split('.').pop().length < 2){
        fpath = fpath + "." + ext;
      }
  
      if (platform.is('ios')) {
        // console.log("saving to IOS");
        targetPath = this.file.documentsDirectory + localFolderPath + "/" + fpath;
      }
      else if(platform.is('android')) {
        targetPath = this.file.externalDataDirectory + localFolderPath + "/" + fpath;
      }
  
      fileTransfer.download(fileurl,targetPath,trustAll).then((entry:FileEntry) => {
        resolver(entry);
      }, (error) => {
        // handle error
        console.log(error);
        reject(error);
      })
      fileTransfer.onProgress((listener)=> {
        this.ngZone.run(()=>{
          let tempprog = Math.round(((listener.loaded / listener.total) * 100));
          if(tempprog > prog){
  
            this.event.publish('ionicImageCacheprogressCounter', tempprog); 
            prog = tempprog;         
          }
  
        })                
        
      })
    });

  }

  addHours(date:Date, hours:number):Date{
    date.setHours(date.getHours()+hours);
    return date;
  }

  addMinutes(date:Date, minutes:number):Date{
    date.setMinutes(date.getMinutes()+minutes);
    return date;
  }

  safeiOSNativeURL(url:string):string{
    let finalURL = url.replace(/^file:\/\//, '');
    return finalURL;
  }

  escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
  }
  replace(find,replace,fullstr){
    return fullstr.replace(new RegExp(this.escapeRegExp(find), 'g'), replace);
  }

  getFilename(url, withExt:boolean = true):string{
    let fileName: string = url.substring(url.lastIndexOf('/')+1);
    let ext = "." + url.split('.').pop();
    return withExt ? fileName : `${fileName.replace(ext,"")}`;
  }

  getFileExtentions(url):string{
    return url.split('.').pop();
  }

}
