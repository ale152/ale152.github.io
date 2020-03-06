---
permalink: /research/
title: "Research"
---

The aim of my research is to use advanced Computer Vision and Machine Learning algorithms for Digital Health. I'm currently working for the [SPHERE Project](https://www.irc-sphere.ac.uk/), which aims at using common sensors like cameras and accelerometers deployed in people's homes to monitor the occupants' general health. My job is to analyse the data and come up with creative algorithms to understand the occupants' health while protecting their privacy.

Some of the most recent projects I worked on include:
* [Sit-to-Stand analysis](#sit-to-stand)
* [Matching video data with wearables](#matching-video-wearables)
* [Calorie estimation from video](#calorie-estimation)

My previous work during my PhD can be found [here](#phd-piv).

<a name="sit-to-stand"></a>
## Sit-to-Stand analysis
One of the ideas we pursued for the [HEmiSPHERE project](https://www.irc-sphere.ac.uk/hemisphere) is to focus on people with mobility issues (i.e. hips or knees surgery patients) and to analyse their peculiar way of standing up. The idea behind this project is that people stand up several times during the day and their speed of standing up is correlated with their physical health. We therefore installed Kinect cameras in the subjects' own living rooms and we pointed them at sofas or armchairs. The cameras only record silhouettes to protect the privacy of the patients.

![Sit-to-Stand algorithm](/assets/images/sts_frames.png "Sit-to-Stand algorithm")

We then wrote an algorithm that uses Convolutional Neural Network to automatically identify stand-up video clips and we analysed the changes in body height (i.e. bounding box) to measure their speed of ascent. This speed of ascent can be measured for several weeks before and after the surgery and can be plotted to show interesting trends.

![Sit-to-Stand trend](/assets/images/sts_trend.png "Sit-to-Stand trend")

If we plot the speed of ascent before and after the surgery we can see that the person stands up much more slowly soon after the surgery (vertical black line). This is probably due to the impairment  caused by pain after the surgery. However, soon after the surgery, we can see a slow but steady increasing trend in the stand-up speed, which results with a final speed that is higher than before the surgery, confirming that the operation was successful.

![Sit-to-Stand no-trend](/assets/images/sts_notrend.png "Sit-to-Stand no-trend")

For comparison, if we look at a healthy participant for a period of 5 months we can see that no particular trend is present in their way of standing up.
To read more about this project, please check out this publication:
> [Sit-to-Stand Analysis in the Wild Using Silhouettes for Longitudinal Health Monitoring](https://arxiv.org/abs/1910.01370) <br/>
> _Masullo A., Burghardt T., Perrett T., Damen D. & Mirmehdi M._<br/>
> August 2019, Lecture Notes in Computer Science (ICIAR).	

<a name="matching-video-wearables"></a>
## Matching video data with wearables
One of the main objectives of the [SPHERE Project](https://www.irc-sphere.ac.uk/) is to achieve health monitoring through the use of non-medical devices. In order to achieve this, we need to fuse information from multiple sensors so that they can cooperate and increase reliability. This aim of this project is to enable the fusion of video (silhouettes) and wearable (accelerometers) devices so that they can be used conjunctly.

The main problem is illustrated in the following figure:

![Video-wearable fusion problem](/assets/images/silhouwear_framework.png "Video-wearable fusion problem")

Let's consider three people in a house, two are wearing a wearable and one is a guest, only two people are in front of the camera. From the video cameras, we can only produce silhouettes for privacy reasons and people cannot be easily recognised from them. How do we know who appears in the image? The accelerometers that we read from the wearables are directly associated with the subjects, but the video data is not, as anyone can appear in front of the camera.

The way we tackle this problem is by looking at the motion. If the silhouette appears as walking we can expect a certain pattern in the accelerometer, whereas if the person is still we expect no motion.

![Video-wearable fusion solution](/assets/images/silhouette_accelerations.png "Video-wearable fusion solution")

Based on this idea we developed a Deep Neural Network that transforms both video and accelerometer streams into feature vectors that can be easily compared. If the video and accelerometer feature vectors as similar, they must be matching.

Results show that this algorithm works really well when the subjects in front of the camera are moving but it doesn't perform well if they're all still.

![Video-wearable fusion results](/assets/images/videowear_result.png "Video-wearable fusion results")

The solution to this problem is simply tracking every person's movement in front of the camera so that the matching is resolved during movement and is tracked over segments with no motion.
To read more about this project, please check out this publication:
> [Person Re-ID by Fusion of Video Silhouettes and Wearable Signals for Home Monitoring Applications](#) <br/>
> Masullo A., Burghardt T., Damen D., Perrett T. & Mirmehdi M._<br/>
> January 2020, _Pending review_

<a name="calorie-estimation"></a>
## Calorie estimation from video
The amount of calories burnt during the day is an important estimation of the activity level and can be seen as a proxy measure of general health. Smartwatches and fitness trackers do a great job at measuring calories burnt while doing sport, but they struggle to work with standard indoor activities like cleaning, vacuuming or tidying up. For this project, the idea was to create an algorithm that uses a camera to understand movements and activities in an indoor environment and automatically estimates the calories burnt.

We recorded a number of people with a Kinect camera and accelerometers while performing some typical activities in a house and we then measured the calories burnt using a portable CO2 device.

![Calorie dataset activities](/assets/images/activities.png "Calorie dataset activities")

Using the 3D skeletons provided by the Kinect we transformed the images into silhouettes so that the algorithm can be deployed into privacy-sensitive environments.

![Silhouettes](/assets/images/silhouettes.png "Silhouettes")

We then trained a Convolutional Neural Network to estimate the calories burnt using silhouettes, acceleration from the wearables and a combination from the two.

![Calorinet](/assets/images/calorinet.png "Calorinet")

The following video shows a comparison with our prediction and the ground truth provided for a validation subject:
 
<a href="http://www.youtube.com/watch?feature=player_embedded&v=eY1At9pZ-j8
" target="_blank"><img src="http://img.youtube.com/vi/eY1At9pZ-j8/0.jpg" 
alt="Calorinet results" width="480" height="360" border="10" /></a>

The method shows really good agreement with the actual calorie profile and performs better than previously proposed methods found in the literature. To read more about this project, please check out this publication:
> [CaloriNet: From silhouettes to calorie estimation in private environments](https://arxiv.org/abs/1806.08152) <br/>
> _Masullo A., Burghardt T., Damen D., Hannuna S., Ponce-López V. & Mirmehdi M._ <br/>
> September 2018, British Machine Vision Conference.	

<a name="phd-piv"></a>
## PhD Research
During my PhD I worked on improving a technique called Particle Image Velocimetry that is used in Aerospace Engineering to measure the velocity field in wind tunnel experiments. The technique involves spraying very thin oil particles in the wind tunnel and taking pictures of them while moving around aerodynamic objects. The analysis of the movement of the particles reveals the underlying flow velocity (tiny red arrow in the gif).

![PIV example](/assets/images/piv.gif "PIV example")

My research was aimed at improving this technique in particularly challenging conditions like reflective surfaces, highly curved objects and strong outliers. My PhD thesis is available [here](/assets/documents/thesis.pdf) and the publications that resulted from it are available [here](/publications/#phd-publications).

During my PhD, I also had the opportunity to teach several labs, including PIV Lab, Programming, Fluid Dynamics, Compressible Fluid Dynamics, Thermodynamics and Engines.

![PIV Lab](/assets/images/piv_lab.jpg "PIV Lab")

![PIV Lab](/assets/images/piv_lab2.jpg "PIV Lab")