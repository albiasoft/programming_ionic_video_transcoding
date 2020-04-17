import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
//import { cloudCredentials } from 'environments/cloud.credentials.prod';
//import { EducfinamentVideoCapture } from 'shared-classes/educfinament.video.capture.class';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  public isProcessingVideo: boolean = false;
  //private videoCapture: EducfinamentVideoCapture;

  constructor(private alertController: AlertController) {
    //this.videoCapture = new EducfinamentVideoCapture(cloudCredentials);
  }

  public loadVideo() {
    this.isProcessingVideo = true;

/*    this.videoCapture.getVideoFromLibrary().then((data) => {
      this.showAlert("VIDEO URL: "+data.videoUrl);
      this.showAlert("THUMBNAIL URL: "+data.thumbnailUrl)
      this.isProcessingVideo = false;
    }, (error) => {
      this.showAlert("ERROR: " + error.message);
      this.isProcessingVideo = false;
    });*/
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
