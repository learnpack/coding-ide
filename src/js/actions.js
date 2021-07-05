import { getParams } from "./utils";
const fullURL = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');

const actions = {
    getHost: function(){
        let preConfig = getParams("config");
        if(preConfig) preConfig = JSON.parse(atob(preConfig));

        const HOST = preConfig ? `${preConfig.address}:${preConfig.port}` : process.env.HOST || getParams('host') || fullURL;
        return HOST;
    },
    loadExercises: function(){
        return new Promise((resolve, reject) =>
            fetch(this.getHost()+'/exercise')
                .then(resp => {
                    if(resp.ok) return resp.json();
                    else throw new Error('There seems to be an error connecting with the server');
                })
                .then(details => {
                    const exercises = Array.isArray(details) ? details : details.exercises;

                    if(Array.isArray(exercises)) resolve(exercises);
                    else throw new Error('No exercises where found on the currect directory');
                })
                .catch((error) => {
                    reject(error);
                })
        );
    },
    loadSingleExercise: function(exerciseSlug){
        return new Promise((resolve, reject) =>
            fetch(this.getHost()+'/exercise/'+exerciseSlug)
                .then(resp => {
                    if(resp.status >= 200 && resp.status < 400) return resp.json();
                    else if(resp.status === 400){
                        resp.json()
                            .then(error => {
                                if(error.type == 'not-found-error'){
                                    const _savedSlug = sessionStorage.getItem('exercise-slug');
                                    if(_savedSlug){
                                        sessionStorage.clear();
                                        window.location.href = "/";
                                    } 
                                }
                                throw new Error(error.message);
                            })
                            .catch(error => {
                                throw new Error('There seems to be an error connecting with the server');
                            });
                    }
                    else throw new Error('There seems to be an error connecting with the server');
                })
                .then(exercise => {
                    if(exercise && Array.isArray(exercise.files)) resolve(exercise);
                    else{
                        throw new Error('Invalid array of files found for the exercise', exercise);
                    }
                })
                .catch((error) => {
                    reject(error);
                })
        );
    },
    loadFile: function(exerciseSlug, file){
        return new Promise((resolve, reject) =>
            fetch(this.getHost()+'/exercise/'+exerciseSlug+'/file/'+(file.name || file)).then(resp => {
                resolve(resp.text());
            })
            .catch(error => reject(error))
        );
    },
    loadReadme: function(exerciseSlug, language='us'){
        return new Promise((resolve, reject) =>
            fetch(this.getHost()+'/exercise/'+exerciseSlug+'/readme?lang='+language).then(resp => {
                if(resp.status == 200){
                    resp.text().then(originalText => {
                        try {
                            const data = JSON.parse(originalText);
                            resolve(data);
                        } catch (e) {
                            console.log("Error", originalText);
                            resolve(originalText);
                        }
                    });
                }
                else reject();
            })
            .catch(error => reject(error))
        );
    },
    saveFile: function(exerciseSlug, file, content){
        return new Promise((resolve, reject) =>
            fetch(this.getHost()+'/exercise/'+exerciseSlug+'/file/'+(file.name || file),{
                method: 'PUT',
                body: content
            })
            .then(resp => resolve(resp.text()))
            .catch(error => reject(error))
        );
    }
};

export const {getHost, loadExercises, loadSingleExercise, loadFile, saveFile, loadReadme } = actions;