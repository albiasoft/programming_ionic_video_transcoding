import { File } from '@ionic-native/file/ngx';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { VideoEditor } from '@ionic-native/video-editor/ngx';
import * as AWS from 'aws-sdk';

interface EducfinamentVideoCaptureResult {
    videoUrl: string;
    thumbnailUrl: string;
}

export class EducfinamentVideoCapture
{
  private file: File = new File();
  private camera: Camera = new Camera();
  private videoEditor: VideoEditor = new VideoEditor();
  private cloudCredentials: any = {};

  constructor(_cloudCredentials: any) {
    this.cloudCredentials = _cloudCredentials;
  }

  public getVideoFromCamera() {
    return this.getVideoAndUploadToS3(this.camera.PictureSourceType.CAMERA);
  }

  public getVideoFromLibrary() {
    return this.getVideoAndUploadToS3(this.camera.PictureSourceType.PHOTOLIBRARY);
  }

  private getVideoAndUploadToS3(sourceType: any) {
    return new Promise<EducfinamentVideoCaptureResult>(function(resolve, reject) {

      let options: CameraOptions = {
        destinationType: this.camera.DestinationType.FILE_URI,
        sourceType: sourceType,
        mediaType: this.camera.MediaType.VIDEO
      }

      let uuid: string = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      let output_filename: string = (new Date().getTime()).toString() + "-" + uuid;

      this.camera.getPicture(options).then(video => {
        this.file.resolveLocalFilesystemUrl(video).then(fileEntry => {
          this.videoEditor.transcodeVideo({
            fileUri: fileEntry.fullPath,
            outputFileName: output_filename + "-video",
            outputFileType: this.videoEditor.OutputFileType.MPEG4,
            optimizeForNetworkUse: this.videoEditor.OptimizeForNetworkUse.YES,
            saveToLibrary: false
/*
            maintainAspectRatio: true, // optional (ios only), defaults to true
            width: 640, // optional, see note below on width and height
            height: 640, // optional, see notes below on width and height
            videoBitrate: 1000000, // optional, bitrate in bits, defaults to 1 megabit (1000000)
            fps: 24, // optional (android only), defaults to 24
            audioChannels: 2, // optional (ios only), number of audio channels, defaults to 2
            audioSampleRate: 44100, // optional (ios only), sample rate for the audio, defaults to 44100
            audioBitrate: 128000, // optional (ios only), audio bitrate for the video in bits, defaults to 128 kilobits (128000)
*/
          }).then((videoFileUri: string) => {
            this.videoEditor.createThumbnail({
              fileUri: fileEntry.fullPath,
              outputFileName: output_filename + "-thumbnail",
              atTime: 2,
              width: 320,
              height: 480,
              quality: 100
            }).then((thumbnailFileUri: string) => {
              this.uploadFile(videoFileUri).then((videoKey: any) => {
                this.uploadFile(thumbnailFileUri).then((thumbnailKey: any) => {
                  resolve({ videoUrl: "https://educfinament.s3-us-west-2.amazonaws.com/"+videoKey,
                            thumbnailUrl: "https://educfinament.s3-us-west-2.amazonaws.com/"+thumbnailKey});
                }, (error: any) => {
                  reject(error);
                });
              }, (error: any) => {
                reject(error);
              });
            }).catch((error: any) => {
              reject(error);
            });
          }).catch((error: any) => {
            reject(error);
          });
        });
      }, (error: any) => {
        reject(error);
      });
    }.bind(this));
  }

  private uploadFile(filename: string) {
    return new Promise(function(resolve, reject) {
      this.file.resolveLocalFilesystemUrl("file://" + filename).then(fileEntry => {
        let path: string = filename.replace(fileEntry.name, "");

        this.file.readAsArrayBuffer("file://"+path, fileEntry.name)
          .then((videoData: ArrayBuffer) => {

            AWS.config.update(this.cloudCredentials);
            var config = {
              region: "us-west-2",
              useDualstack: false,
              useAccelerateEndpoint: false,
              s3ForcePathStyle: false,
              maxRetries: 0
            };

            var s3 = new AWS.S3(config);
            let key: string = "videos/"+fileEntry.name;
            s3.putObject({ Bucket: 'educfinament', Key: key, Body: videoData }, function(err, data) {
              if (err) {
                reject(err);
              } else {
                resolve(key);
              }
            }.bind(this));

          })
          .catch((error) => {
            reject(error);
          });
      }).catch((error) => {
        reject(error);
      });
    }.bind(this));
  }

}
