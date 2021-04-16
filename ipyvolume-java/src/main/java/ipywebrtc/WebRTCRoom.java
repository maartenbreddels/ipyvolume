package ipywebrtc;


import com.twosigma.beakerx.widget.DOMWidget;

import java.util.ArrayList;
import java.util.List;

public class WebRTCRoom extends DOMWidget {



  public static final String MODEL_MODULE_VALUE = "jupyter-webrtc";
  public static final String MODEL_MODULE_VERSION_VALUE = "~0.3.0";
  public static final String MODEL_NAME_VALUE = "WebRTCRoomModel";
  public static final String ID = "id";
  public static final String NICKNAME = "nickname";
  public static final String PEERS = "peers";
  public static final String ROOM = "room";
  public static final String STREAM = "stream";
  public static final String STREAMS = "streams";

  private String id = null;
  private String nickname = "anonymous";
  private List peers = new ArrayList<>();
  private String room = "room";
  private Object stream = null;
  private List streams = new ArrayList<>();

  public WebRTCRoom() {
    super();
    openComm();
  }

  @Override
  public void updateValue(Object value) {

  }

  public String getModelModuleValue(){
    return MODEL_MODULE_VALUE;
  }

  public String getModelModuleVersionValue(){
    return MODEL_MODULE_VERSION_VALUE;
  }

  public String getModelNameValue(){
    return MODEL_NAME_VALUE;
  }

  @Override
  public String getViewNameValue() {
    return null;
  }

  public String getId() {
    return id;
  }
  public void setId(String id){
    this.id = id;
    sendUpdate(ID, id);
  }

  public String getNickname() {
    return nickname;
  }
  public void setNickname(String nickname){
    this.nickname = nickname;
    sendUpdate(NICKNAME, nickname);
  }

  public List getPeers() {
    return peers;
  }
  public void setPeers(List peers){
    this.peers = peers;
    sendUpdate(PEERS, peers);
  }

  public String getRoom() {
    return room;
  }
  public void setRoom(String room){
    this.room = room;
    sendUpdate(ROOM, room);
  }

  public Object getStream() {
    return stream;
  }
  public void setStream(Object stream){
    this.stream = stream;
    sendUpdate(STREAM, stream);
  }

  public List getStreams() {
    return streams;
  }
  public void setStreams(List streams){
    this.streams = streams;
    sendUpdate(STREAMS, streams);
  }

}
