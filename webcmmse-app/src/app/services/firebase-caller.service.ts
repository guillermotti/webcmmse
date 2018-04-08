import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AngularFirestore } from 'angularfire2/firestore';
import { Query } from '@firebase/firestore-types';

@Injectable()
export class FirebaseCallerService {

  constructor(private db: AngularFirestore) { }

  public getCollection(collection): Observable<any[]> {
    return this.db.collection(collection).valueChanges();
  }

  public getUserFromCollection(userEmail, collection): Observable<any[]> {
    return this.db.collection(collection, ref => ref.where('email', '==', userEmail)).valueChanges();
  }

  public getItemFromCollection(id, collection): Observable<any[]> {
    return this.db.collection(collection, ref => ref.where('id', '==', id)).valueChanges();
  }

  public addItemToCollection(collection, item): any {
    return this.db.collection(collection).add(item)
    .then(docRef => {
      this.db.collection(collection).doc(docRef.id).update({
        id: docRef.id
      });
    })
    .catch(function(error) {
      console.error('Error', error);
    });
  }

  public updateItemFromCollection(collection, id, data): any {
     return this.db.collection(collection).doc(id).update(data);
  }

  public deleteItemFromCollection(collection, id): any {
    return this.db.collection(collection).doc(id).delete();
  }

}
