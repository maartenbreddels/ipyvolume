package ipywebrtc;


public class CameraStream extends MediaStream {



  public static final String MODEL_NAME_VALUE = "CameraStreamModel";
  public static final String AUDIO = "audio";
  public static final String VIDEO = "video";

  private boolean audio = true;
  private boolean video = true;

  public CameraStream() {
    super();
    openComm();
  }

  public String getModelNameValue(){
    return MODEL_NAME_VALUE;
  }

  public boolean getAudio() {
    return audio;
  }
  public void setAudio(boolean audio){
    this.audio = audio;
    sendUpdate(AUDIO, audio);
  }

  public boolean getVideo() {
    return video;
  }
  public void setVideo(boolean video){
    this.video = video;
    sendUpdate(VIDEO, video);
  }

}
