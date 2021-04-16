/*
 *  Copyright 2017 TWO SIGMA OPEN SOURCE, LLC
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *import static org.assertj.core.api.Assertions.assertThat;
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

package ipyvolume;

import com.twosigma.beakerx.widget.Box;
import com.twosigma.beakerx.widget.FloatSlider;
import com.twosigma.beakerx.widget.HBox;
import com.twosigma.beakerx.widget.ToggleButton;
import com.twosigma.beakerx.widget.ToggleButtons;
import com.twosigma.beakerx.widget.VBox;
import com.twosigma.beakerx.widget.Widget;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class PyLab {

    private static Current current = new Current();

    public static Figure volShow(float[][][] data) {
        boolean lighting = false;
        Float dataMin = null;
        Float dataMax = null;
        boolean stereo = false;
        float ambientCoefficient = 0.5f;
        float diffuseCoefficient = 0.8f;
        float specularCoefficient = 0.5f;
        int specularExponent = 5;
        float downscale = 1;
        List<Float> level = Arrays.asList(0.1f, 0.5f, 0.9f);
        List<Float> opacity = Arrays.asList(0.01f, 0.05f, 0.1f);
        float levelWidth= 0.1f;
        boolean controls = true;
        float maxOpacity = 0.2f;
        Object extent = null;

        Figure vol = gcf();

        if (dataMin == null) {
            dataMin = nanmin(data);
        }
        if (dataMax == null) {
            dataMax = nanmax(data);
        }
        vol.setTf(transferFunction());
        vol.setVolumeData(data);
        vol.setDataMin(dataMin);
        vol.setDataMax(dataMax);
        vol.setStereo(stereo);
        vol.setAmbientCoefficient(ambientCoefficient);
        vol.setDiffuseCoefficient(diffuseCoefficient);
        vol.setSpecularCoefficient(specularCoefficient);
        vol.setSpecularExponent(specularExponent);
        vol.setExtent(extent);
        if (extent != null) {
        }
        if (controls) {
            FloatSlider ambientCoefficientControl = new FloatSlider();
                ambientCoefficientControl.setStep(0.01);
                ambientCoefficientControl.setMax(1);
                ambientCoefficientControl.setMin(0);
                ambientCoefficientControl.setValue(ambientCoefficient);
                ambientCoefficientControl.setDescription("ambient");
            FloatSlider diffuseCoefficientControl = new FloatSlider();
                diffuseCoefficientControl.setStep(0.01);
                diffuseCoefficientControl.setMax(1);
                diffuseCoefficientControl.setMin(0);
                diffuseCoefficientControl.setValue(diffuseCoefficient);
                diffuseCoefficientControl.setDescription("diffuse");
            FloatSlider specularCoefficientControl = new FloatSlider();
                specularCoefficientControl.setStep(0.01);
                specularCoefficientControl.setMax(1);
                specularCoefficientControl.setMin(0);
                specularCoefficientControl.setValue(specularCoefficient);
                specularCoefficientControl.setDescription("specular");
            FloatSlider specularExponentControl = new FloatSlider();
                specularExponentControl.setStep(0.01);
                specularExponentControl.setMax(1);
                specularExponentControl.setMin(0);
                specularExponentControl.setValue(specularExponent);
                specularExponentControl.setDescription("specular exp");
            new HBox(Arrays.asList(ambientCoefficientControl, diffuseCoefficientControl));
            List<Widget> widgets_bottom = Arrays.asList(
                    new HBox(Arrays.asList(ambientCoefficientControl, diffuseCoefficientControl)),
                    new HBox(Arrays.asList(specularCoefficientControl, specularExponentControl))
            );
            current.container = new VBox(widgets_bottom);
        }
        return vol;
    }


    private static TransferFunction transferFunction() {
        TransferFunctionWidgetJs3 tf = new TransferFunctionWidgetJs3();
        Figure fig = gcf();
        return tf;
    }

    private static Figure figure(String key, boolean controls, boolean controls_vr, boolean debug) {
        if (!key.isEmpty() && current.figures.containsKey(key)) {
            current.figure = current.figures.get(key);
            current.container = current.containers.get(key);
        } else {
            current.figure = new Figure();
            List<Widget> widgetList = new ArrayList<>();
            if (key.isEmpty()) {
                key = UUID.randomUUID().toString();
            }
            if (controls) {
                ToggleButton stereo = new ToggleButton();
                stereo.setValue(current.figure.getStereo());
                stereo.setDescription("stereo");
                stereo.setIcon("eye");
                widgetList.add(stereo);
            }
            if (controls_vr) {
                FloatSlider eyeSeparation = new FloatSlider();
                eyeSeparation.setValue(current.figure.getEyeSeparation());
                eyeSeparation.setMin(-10);
                eyeSeparation.setMax(10);
                widgetList.add(eyeSeparation);
            }
            if (debug) {
                ToggleButtons show = new ToggleButtons();
                show.setOptions(Arrays.asList("Volume", "Back", "Front"));
                widgetList.add(show);
            }
            current.containers.put(key, new VBox(widgetList));
        }
        return current.figure;
    }

    private static Figure gcf() {
        if (current.figure == null){
            return new Figure();
        }
        else {
            return current.figure;
        }
    }

    public static float nanmax(float[][][] data) {
        return maxmin(data, true);
    }

    public static float nanmin(float[][][] data) {
        return maxmin(data, false);
    }

    private static float maxmin(float[][][] data, boolean max) {
        int size = data.length;
        float ext = data[0][0][0];
        for (int x = 0; x < size; x++) {
            for (int y=0; y < size; y++){
                for (int z=0; z < size; z++) {
                    float curr = data[x][y][z];
                    if (max && curr > ext) {
                        ext = curr;
                    } else if (curr < ext) {
                        ext = curr;
                    }
                }
            }
        }
        return ext;
    }

    public static void show(Widget ... extraWidgets) {
        gcf();
        gcc().display();
        for (Widget widget : extraWidgets) {
            widget.display();
        }

    }

    private static Box gcc() {
        gcf();
        return current.container;
    }

    private static class Current {
        Figure figure = null;
        Box container = null;
        Map<String, Figure> figures = new HashMap<>();
        Map<String, Box> containers = new HashMap<>();
    }
}