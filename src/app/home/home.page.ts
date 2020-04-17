import { Component } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { environment } from 'environments/environment';
import { TranscodeUploadVideo } from 'classes/transcode.upload.video.class';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  public isProcessingVideo: Boolean = false;
  public isVideoUploaded: Boolean = false;
  public urlThumbnail: string;
  public urlVideo: string;
  private loadingIndicator: any;
  private videoUploader: TranscodeUploadVideo;

  constructor(private alertController: AlertController, public loadingController: LoadingController) {
    this.videoUploader = new TranscodeUploadVideo(environment.cloudCredentials);
  }

  public uploadVideo() {
    this.isProcessingVideo = true;
    this.videoUploader.getVideo(async () => {
      await this.showLoaderIndicator("Transcoding video...");
    }, async () => {
      await this.hideLoaderIndicator();
      await this.showLoaderIndicator("Uploading video...");
    }).then((data) => {
      this.hideLoaderIndicator();
      this.isProcessingVideo = false;
      this.isVideoUploaded = true;
      this.urlVideo = data.videoUrl;
      this.urlThumbnail = data.thumbnailUrl;
      this.showAlert("VIDEO URL: "+this.urlVideo);
      this.showAlert("THUMBNAIL URL: "+this.urlThumbnail);
    }, (error) => {
      this.hideLoaderIndicator();
      this.showAlert("ERROR: " + error);
      this.isProcessingVideo = false;
      this.isVideoUploaded = false;
    });
  }

  async showLoaderIndicator(msg: string) {
    this.loadingIndicator = await this.loadingController.create({
      message: msg
    });
    await this.loadingIndicator.present();
  }

  async hideLoaderIndicator(delay: number = 0) {
    if(this.loadingIndicator) {
      if (delay) {
        setTimeout(() => { this.loadingIndicator.dismiss(); }, delay);
      } else {
        this.loadingIndicator.dismiss();
      }
    }
  }

  async showAlert(msg: string) {
    const alert = await this.alertController.create({
      header: 'Alert',
      subHeader: '',
      message: msg,
      buttons: ['OK']
    });

    await alert.present();
  }
}
